# admin_panel/views.py - Complete working views with real database operations

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg, Q
from django.core.paginator import Paginator
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils.text import slugify
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import transaction
import json
from datetime import datetime, timedelta
from django.utils import timezone
import os

# Import models
from store.models import Product, ProductCategory, Order, OrderItem, ProductImage, ProductSpecification
from services.models import ServiceRequest, ServiceCategory, TechnicianRating
from users.models import CustomUser
from users.forms import CustomUserCreationForm

User = get_user_model()

@method_decorator(staff_member_required, name='dispatch')
class AdminDashboardView(TemplateView):
    template_name = 'admin_panel/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get current month and last month for comparison
        now = timezone.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
        
        # Basic stats
        context.update({
            'total_users': User.objects.count(),
            'total_customers': User.objects.filter(role='CUSTOMER').count(),
            'total_technicians': User.objects.filter(role='TECHNICIAN').count(),
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(is_active=True).count(),
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(status='PENDING').count(),
            'unassigned_orders': Order.objects.filter(technician__isnull=True).count(),
            'total_services': ServiceRequest.objects.count(),
            'pending_services': ServiceRequest.objects.filter(status='SUBMITTED').count(),
            'unassigned_services': ServiceRequest.objects.filter(technician__isnull=True).count(),
        })
        
        # Recent orders
        context['recent_orders'] = Order.objects.select_related('customer', 'technician').order_by('-order_date')[:10]
        
        # Recent services
        context['recent_services'] = ServiceRequest.objects.select_related('customer', 'technician', 'service_category').order_by('-request_date')[:10]
        
        # Monthly revenue - calculate safely
        try:
            current_month_revenue = Order.objects.filter(
                order_date__gte=current_month_start,
                status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            ).aggregate(
                total=Sum('total_amount')
            )['total'] or 0
        except:
            current_month_revenue = 0
        
        context['current_month_revenue'] = current_month_revenue
        
        # Top technicians by rating
        context['top_technicians'] = User.objects.filter(
            role='TECHNICIAN'
        ).annotate(
            avg_rating=Avg('ratings_received__rating'),
            total_orders=Count('assigned_orders'),
            total_services=Count('assigned_services'),
            total_jobs=Count('assigned_orders') + Count('assigned_services')
        ).order_by('-avg_rating')[:5]
        
        return context

@method_decorator(staff_member_required, name='dispatch')
class AdminUsersView(View):
    def get(self, request):
        # Get filter parameters
        role_filter = request.GET.get('role', '')
        search = request.GET.get('search', '')
        
        # Build queryset
        users = User.objects.all()
        
        if role_filter:
            users = users.filter(role=role_filter)
        
        if search:
            users = users.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        users = users.order_by('-date_joined')
        
        # Pagination
        paginator = Paginator(users, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'users': page_obj,
            'role_filter': role_filter,
            'search': search,
            'user_roles': User.Role.choices,
        }
        
        return render(request, 'admin_panel/users.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminProductsView(View):
    def get(self, request):
        # Get filter parameters
        category_filter = request.GET.get('category', '')
        status_filter = request.GET.get('status', '')
        search = request.GET.get('search', '')
        
        # Build queryset
        products = Product.objects.select_related('category')
        
        if category_filter:
            products = products.filter(category_id=category_filter)
        
        if status_filter == 'active':
            products = products.filter(is_active=True)
        elif status_filter == 'inactive':
            products = products.filter(is_active=False)
        
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(brand__icontains=search)
            )
        
        products = products.order_by('-created_at')
        
        # Pagination
        paginator = Paginator(products, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'products': page_obj,
            'categories': ProductCategory.objects.all(),
            'category_filter': category_filter,
            'status_filter': status_filter,
            'search': search,
        }
        
        return render(request, 'admin_panel/products.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminCreateProductView(View):
    def get(self, request):
        categories = ProductCategory.objects.all()
        context = {'categories': categories}
        return render(request, 'admin_panel/create_product.html', context)
    
    def post(self, request):
        try:
            with transaction.atomic():
                # Get form data
                name = request.POST.get('name')
                brand = request.POST.get('brand', '')
                category_id = request.POST.get('category')
                model_number = request.POST.get('model_number', '')
                description = request.POST.get('description')
                price = request.POST.get('price')
                stock = request.POST.get('stock')
                weight = request.POST.get('weight') or None
                dimensions = request.POST.get('dimensions', '')
                delivery_time_info = request.POST.get('delivery_time_info', '')
                features = request.POST.get('features', '')
                warranty_period = request.POST.get('warranty_period', '1 Year')
                meta_description = request.POST.get('meta_description', '')
                is_active = request.POST.get('is_active') == 'true'
                is_featured = request.POST.get('is_featured') == 'true'
                
                # Validation
                if not all([name, category_id, description, price, stock]):
                    messages.error(request, 'Please fill in all required fields')
                    return redirect('admin_panel:create_product')
                
                # Get category
                try:
                    category = ProductCategory.objects.get(id=category_id)
                except ProductCategory.DoesNotExist:
                    messages.error(request, 'Invalid category selected')
                    return redirect('admin_panel:create_product')
                
                # Create slug
                slug = slugify(name)
                original_slug = slug
                counter = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{original_slug}-{counter}"
                    counter += 1
                
                # Create product
                product = Product.objects.create(
                    name=name,
                    slug=slug,
                    brand=brand,
                    category=category,
                    model_number=model_number,
                    description=description,
                    price=price,
                    stock=stock,
                    weight=weight if weight else None,
                    dimensions=dimensions,
                    delivery_time_info=delivery_time_info,
                    features=features,
                    warranty_period=warranty_period,
                    meta_description=meta_description,
                    is_active=is_active,
                    is_featured=is_featured
                )
                
                # Handle main image
                if 'image' in request.FILES:
                    product.image = request.FILES['image']
                    product.save()
                
                # Handle additional images (up to 10)
                if 'additional_images' in request.FILES:
                    additional_images = request.FILES.getlist('additional_images')
                    for i, image_file in enumerate(additional_images[:10]):  # Limit to 10
                        ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            alt_text=f"{product.name} - Image {i+1}",
                            order=i
                        )
                
                # Handle specifications
                spec_names = request.POST.getlist('spec_names[]')
                spec_values = request.POST.getlist('spec_values[]')
                
                for i, (spec_name, spec_value) in enumerate(zip(spec_names, spec_values)):
                    if spec_name.strip() and spec_value.strip():
                        ProductSpecification.objects.create(
                            product=product,
                            name=spec_name.strip(),
                            value=spec_value.strip(),
                            order=i
                        )
                
                messages.success(request, f'Product "{product.name}" created successfully!')
                return redirect('admin_panel:products')
                
        except Exception as e:
            messages.error(request, f'Error creating product: {str(e)}')
            return redirect('admin_panel:create_product')

@method_decorator(staff_member_required, name='dispatch')
class AdminEditProductView(View):
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        categories = ProductCategory.objects.all()
        context = {
            'product': product,
            'categories': categories
        }
        return render(request, 'admin_panel/edit_product.html', context)
    
    def post(self, request, product_id):
        try:
            with transaction.atomic():
                product = get_object_or_404(Product, id=product_id)
                
                # Update product fields
                product.name = request.POST.get('name')
                product.brand = request.POST.get('brand', '')
                product.model_number = request.POST.get('model_number', '')
                product.description = request.POST.get('description')
                product.price = request.POST.get('price')
                product.stock = request.POST.get('stock')
                product.weight = request.POST.get('weight') or None
                product.dimensions = request.POST.get('dimensions', '')
                product.delivery_time_info = request.POST.get('delivery_time_info', '')
                product.features = request.POST.get('features', '')
                product.warranty_period = request.POST.get('warranty_period', '1 Year')
                product.meta_description = request.POST.get('meta_description', '')
                product.is_active = request.POST.get('is_active') == 'true'
                product.is_featured = request.POST.get('is_featured') == 'true'
                
                # Update category if changed
                category_id = request.POST.get('category')
                if category_id:
                    category = get_object_or_404(ProductCategory, id=category_id)
                    product.category = category
                
                # Handle new main image
                if 'new_main_image' in request.FILES:
                    # Delete old image if exists
                    if product.image:
                        product.image.delete()
                    product.image = request.FILES['new_main_image']
                
                product.save()
                
                # Handle removed images
                removed_images = request.POST.getlist('removed_images[]')
                for image_id in removed_images:
                    try:
                        image = ProductImage.objects.get(id=image_id, product=product)
                        image.delete()  # This will also delete the file
                    except ProductImage.DoesNotExist:
                        pass
                
                # Handle new additional images (up to 10)
                if 'new_additional_images' in request.FILES:
                    existing_count = product.additional_images.count()
                    new_images = request.FILES.getlist('new_additional_images')
                    for i, image_file in enumerate(new_images[:10]):  # Limit to 10
                        ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            alt_text=f"{product.name} - Image {existing_count + i + 1}",
                            order=existing_count + i
                        )
                
                # Update specifications
                # First, delete existing specs
                product.specifications.all().delete()
                
                # Add new specs
                spec_names = request.POST.getlist('spec_names[]')
                spec_values = request.POST.getlist('spec_values[]')
                
                for i, (spec_name, spec_value) in enumerate(zip(spec_names, spec_values)):
                    if spec_name.strip() and spec_value.strip():
                        ProductSpecification.objects.create(
                            product=product,
                            name=spec_name.strip(),
                            value=spec_value.strip(),
                            order=i
                        )
                
                messages.success(request, f'Product "{product.name}" updated successfully!')
                return redirect('admin_panel:products')
                
        except Exception as e:
            messages.error(request, f'Error updating product: {str(e)}')
            return redirect('admin_panel:edit_product', product_id=product_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminDeleteProductView(View):
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        product_name = product.name
        
        try:
            # Delete product (images will be deleted automatically due to model setup)
            product.delete()
            messages.success(request, f'Product "{product_name}" deleted successfully!')
        except Exception as e:
            messages.error(request, f'Error deleting product: {str(e)}')
        
        return redirect('admin_panel:products')

@method_decorator(staff_member_required, name='dispatch')
class AdminCreateUserView(View):
    def get(self, request):
        form = CustomUserCreationForm()
        return render(request, 'admin_panel/create_user.html', {'form': form})
    
    def post(self, request):
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'User "{user.name}" created successfully!')
            return redirect('admin_panel:users')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
        
        return render(request, 'admin_panel/create_user.html', {'form': form})

@method_decorator(staff_member_required, name='dispatch')
class AdminEditUserView(View):
    def get(self, request, user_id):
        user_obj = get_object_or_404(User, id=user_id)
        context = {'user_obj': user_obj}
        return render(request, 'admin_panel/edit_user.html', context)
    
    def post(self, request, user_id):
        user_obj = get_object_or_404(User, id=user_id)
        
        try:
            user_obj.name = request.POST.get('name')
            user_obj.email = request.POST.get('email')
            user_obj.phone = request.POST.get('phone', '')
            user_obj.role = request.POST.get('role')
            user_obj.is_active = request.POST.get('is_active') == 'on'
            user_obj.email_notifications = request.POST.get('email_notifications') == 'on'
            user_obj.sms_notifications = request.POST.get('sms_notifications') == 'on'
            
            user_obj.save()
            messages.success(request, f'User "{user_obj.name}" updated successfully!')
            return redirect('admin_panel:users')
            
        except Exception as e:
            messages.error(request, f'Error updating user: {str(e)}')
            return redirect('admin_panel:edit_user', user_id=user_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminDeleteUserView(View):
    def post(self, request, user_id):
        user_obj = get_object_or_404(User, id=user_id)
        
        if user_obj.is_superuser:
            messages.error(request, 'Cannot delete superuser account')
            return redirect('admin_panel:users')
        
        user_name = user_obj.name
        try:
            user_obj.delete()
            messages.success(request, f'User "{user_name}" deleted successfully!')
        except Exception as e:
            messages.error(request, f'Error deleting user: {str(e)}')
        
        return redirect('admin_panel:users')

# Orders Management Views
@method_decorator(staff_member_required, name='dispatch')
class AdminOrdersView(View):
    def get(self, request):
        # Get filter parameters
        status_filter = request.GET.get('status', '')
        technician_filter = request.GET.get('technician', '')
        search = request.GET.get('search', '')
        
        # Build queryset
        orders = Order.objects.select_related('customer', 'technician', 'shipping_address').prefetch_related('items__product')
        
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        if technician_filter == 'unassigned':
            orders = orders.filter(technician__isnull=True)
        elif technician_filter:
            orders = orders.filter(technician_id=technician_filter)
        
        if search:
            orders = orders.filter(
                Q(id__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(customer__email__icontains=search)
            )
        
        orders = orders.order_by('-order_date')
        
        # Calculate real stats for the current filtered orders
        all_orders = Order.objects.all()
        if status_filter or technician_filter or search:
            # If filtered, show stats for all orders, not just filtered ones
            stats_orders = all_orders
        else:
            stats_orders = all_orders
        
        pending_count = stats_orders.filter(status='PENDING').count()
        unassigned_count = stats_orders.filter(technician__isnull=True).count()
        processing_count = stats_orders.filter(status='PROCESSING').count()
        completed_count = stats_orders.filter(status='DELIVERED').count()
        
        # Pagination
        paginator = Paginator(orders, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'orders': page_obj,
            'technicians': User.objects.filter(role='TECHNICIAN'),
            'status_choices': Order.STATUS_CHOICES,
            'status_filter': status_filter,
            'technician_filter': technician_filter,
            'search': search,
            # Real stats
            'pending_count': pending_count,
            'unassigned_count': unassigned_count,
            'processing_count': processing_count,
            'completed_count': completed_count,
        }
        
        return render(request, 'admin_panel/orders.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminEditOrderView(View):
    def get(self, request, order_id):
        order = get_object_or_404(
            Order.objects.select_related('customer', 'technician', 'shipping_address').prefetch_related('items__product'),
            id=order_id
        )
        context = {
            'order': order,
            'technicians': User.objects.filter(role='TECHNICIAN'),
            'status_choices': Order.STATUS_CHOICES,
        }
        return render(request, 'admin_panel/edit_order.html', context)

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        try:
            # Update status if provided
            status = request.POST.get('status')
            if status:
                order.status = status

            # Assign technician if provided
            technician_id = request.POST.get('technician_id')
            if technician_id:
                technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
                order.technician = technician
                if order.status == 'PENDING':
                    order.status = 'PROCESSING'

            order.save()
            messages.success(request, f'Order #{order.id} updated successfully!')
            return redirect('admin_panel:orders')
        except Exception as e:
            messages.error(request, f'Error updating order: {str(e)}')
            return redirect('admin_panel:edit_order', order_id=order_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminDeleteOrderView(View):
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        order_number = order.id
        
        try:
            # Delete order (related items will be deleted automatically due to CASCADE)
            order.delete()
            messages.success(request, f'Order #{order_number} deleted successfully!')
        except Exception as e:
            messages.error(request, f'Error deleting order: {str(e)}')
        
        return redirect('admin_panel:orders')

@method_decorator(staff_member_required, name='dispatch')
class AdminAssignTechnicianView(View):
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        try:
            technician_id = request.POST.get('technician_id')
            technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
            order.technician = technician
            if order.status == 'PENDING':
                order.status = 'PROCESSING'
            order.save()
            messages.success(request, f'Technician assigned to Order #{order.id}.')
            return redirect('admin_panel:edit_order', order_id=order_id)
        except Exception as e:
            messages.error(request, f'Error assigning technician: {str(e)}')
            return redirect('admin_panel:edit_order', order_id=order_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminServicesView(View):
    def get(self, request):
        # Get filter parameters
        status_filter = request.GET.get('status', '')
        technician_filter = request.GET.get('technician', '')
        category_filter = request.GET.get('category', '')
        search = request.GET.get('search', '')
        
        # Build queryset
        services = ServiceRequest.objects.select_related('customer', 'technician', 'service_category', 'service_location')
        
        if status_filter:
            services = services.filter(status=status_filter)
        
        if technician_filter == 'unassigned':
            services = services.filter(technician__isnull=True)
        elif technician_filter:
            services = services.filter(technician_id=technician_filter)
        
        if category_filter:
            services = services.filter(service_category_id=category_filter)
        
        if search:
            services = services.filter(
                Q(id__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(customer__email__icontains=search) |
                Q(custom_description__icontains=search)
            )
        
        services = services.order_by('-request_date')
        
        # Pagination
        paginator = Paginator(services, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'services': page_obj,
            'technicians': User.objects.filter(role='TECHNICIAN'),
            'service_categories': ServiceCategory.objects.all(),
            'status_choices': ServiceRequest.STATUS_CHOICES,
            'status_filter': status_filter,
            'technician_filter': technician_filter,
            'category_filter': category_filter,
            'search': search,
        }
        
        return render(request, 'admin_panel/services.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminEditServiceView(View):
    def get(self, request, service_id):
        service = get_object_or_404(
            ServiceRequest.objects.select_related('customer', 'technician', 'service_category', 'service_location'),
            id=service_id
        )
        context = {
            'service': service,
            'technicians': User.objects.filter(role='TECHNICIAN'),
            'status_choices': ServiceRequest.STATUS_CHOICES,
        }
        return render(request, 'admin_panel/edit_service.html', context)

    def post(self, request, service_id):
        service = get_object_or_404(ServiceRequest, id=service_id)
        try:
            status = request.POST.get('status')
            if status:
                service.status = status

            technician_id = request.POST.get('technician_id')
            if technician_id:
                technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
                service.technician = technician
                if service.status == 'SUBMITTED':
                    service.status = 'ASSIGNED'

            service.save()
            messages.success(request, f'Service Request #{service.id} updated successfully!')
            return redirect('admin_panel:services')
        except Exception as e:
            messages.error(request, f'Error updating service request: {str(e)}')
            return redirect('admin_panel:edit_service', service_id=service_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminAssignServiceTechnicianView(View):
    def post(self, request, service_id):
        service = get_object_or_404(ServiceRequest, id=service_id)
        try:
            technician_id = request.POST.get('technician_id')
            technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
            service.technician = technician
            if service.status == 'SUBMITTED':
                service.status = 'ASSIGNED'
            service.save()
            messages.success(request, f'Technician assigned to Service Request #{service.id}.')
            return redirect('admin_panel:edit_service', service_id=service_id)
        except Exception as e:
            messages.error(request, f'Error assigning technician: {str(e)}')
            return redirect('admin_panel:edit_service', service_id=service_id)

@method_decorator(staff_member_required, name='dispatch')
class AdminCategoriesView(View):
    def get(self, request):
        categories = ProductCategory.objects.annotate(
            product_count=Count('products')
        ).order_by('name')
        
        service_categories = ServiceCategory.objects.annotate(
            service_count=Count('servicerequest')
        ).order_by('name')
        
        context = {
            'categories': categories,
            'service_categories': service_categories,
        }
        
        return render(request, 'admin_panel/categories.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminCreateCategoryView(View):
    def post(self, request):
        category_type = request.POST.get('type')  # 'product' or 'service'
        name = request.POST.get('name')
        slug = request.POST.get('slug', '')
        
        try:
            if category_type == 'product':
                if not slug:
                    slug = slugify(name)
                
                # Check if slug exists
                original_slug = slug
                counter = 1
                while ProductCategory.objects.filter(slug=slug).exists():
                    slug = f"{original_slug}-{counter}"
                    counter += 1
                
                ProductCategory.objects.create(name=name, slug=slug)
                messages.success(request, f'Product category "{name}" created successfully!')
            
            elif category_type == 'service':
                ServiceCategory.objects.create(name=name)
                messages.success(request, f'Service category "{name}" created successfully!')
            
        except Exception as e:
            messages.error(request, f'Error creating category: {str(e)}')
        
        return redirect('admin_panel:categories')

@method_decorator(staff_member_required, name='dispatch')
class AdminEditCategoryView(View):
    def post(self, request, category_id):
        category_type = request.POST.get('type')
        name = request.POST.get('name')
        slug = request.POST.get('slug', '')
        
        try:
            if category_type == 'product':
                category = get_object_or_404(ProductCategory, id=category_id)
                category.name = name
                if slug:
                    category.slug = slug
                category.save()
                messages.success(request, f'Product category "{name}" updated successfully!')
            
            elif category_type == 'service':
                category = get_object_or_404(ServiceCategory, id=category_id)
                category.name = name
                category.save()
                messages.success(request, f'Service category "{name}" updated successfully!')
            
        except Exception as e:
            messages.error(request, f'Error updating category: {str(e)}')
        
        return redirect('admin_panel:categories')

@method_decorator(staff_member_required, name='dispatch')
class AdminAnalyticsView(TemplateView):
    template_name = 'admin_panel/analytics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Monthly data for charts
        monthly_orders = []
        monthly_revenue = []
        
        for i in range(12, 0, -1):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            orders_count = Order.objects.filter(
                order_date__range=[month_start, month_end]
            ).count()
            
            try:
                revenue = Order.objects.filter(
                    order_date__range=[month_start, month_end],
                    status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
                ).aggregate(total=Sum('total_amount'))['total'] or 0
            except:
                revenue = 0
            
            monthly_orders.append({
                'month': month_start.strftime('%b %Y'),
                'count': orders_count
            })
            
            monthly_revenue.append({
                'month': month_start.strftime('%b %Y'),
                'amount': float(revenue)
            })
        
        context.update({
            'monthly_orders': json.dumps(monthly_orders),
            'monthly_revenue': json.dumps(monthly_revenue),
        })
        
        return context

@method_decorator(staff_member_required, name='dispatch')
class AdminSettingsView(TemplateView):
    template_name = 'admin_panel/settings.html'

# API Views for AJAX operations
@staff_member_required
def admin_stats_api(request):
    """API endpoint for dashboard stats"""
    try:
        stats = {
            'total_users': User.objects.count(),
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(status='PENDING').count(),
            'total_revenue': float(Order.objects.filter(
                status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            ).aggregate(total=Sum('total_amount'))['total'] or 0),
        }
        return JsonResponse(stats)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@staff_member_required
def get_order_details_api(request, order_id):
    """API endpoint for getting order details"""
    try:
        order = get_object_or_404(
            Order.objects.select_related('customer', 'technician', 'shipping_address').prefetch_related('items__product'),
            id=order_id
        )
        
        # Build order data
        order_data = {
            'id': order.id,
            'status': order.status,
            'total_amount': str(order.total_amount),
            'order_date': order.order_date.strftime('%B %d, %Y at %I:%M %p'),
            'customer': {
                'name': order.customer.name,
                'email': order.customer.email,
                'phone': order.customer.phone or 'N/A'
            },
            'technician': order.technician.name if order.technician else None,
            'shipping_address': str(order.shipping_address) if order.shipping_address else 'N/A',
            'items': []
        }
        
        # Add items
        for item in order.items.all():
            item_total = float(item.price) * item.quantity
            order_data['items'].append({
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': str(item.price),
                'total': str(item_total)
            })
        
        return JsonResponse({
            'success': True,
            'order': order_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@staff_member_required
@require_POST
@csrf_exempt
def assign_technician_api(request):
    """API endpoint for assigning technicians"""
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        technician_id = data.get('technician_id')
        
        order = get_object_or_404(Order, id=order_id)
        technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
        
        order.technician = technician
        if order.status == 'PENDING':
            order.status = 'PROCESSING'
        order.save()
        
        return JsonResponse({'success': True, 'message': 'Technician assigned successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@staff_member_required
@require_POST
@csrf_exempt
def update_order_status_api(request):
    """API endpoint for updating order status"""
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        status = data.get('status')
        
        order = get_object_or_404(Order, id=order_id)
        order.status = status
        order.save()
        
        return JsonResponse({'success': True, 'message': 'Order status updated successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@staff_member_required
@require_POST
@csrf_exempt
def update_service_status_api(request):
    """API endpoint for updating service status"""
    try:
        data = json.loads(request.body)
        service_id = data.get('service_id')
        status = data.get('status')
        
        service = get_object_or_404(ServiceRequest, id=service_id)
        service.status = status
        service.save()
        
        return JsonResponse({'success': True, 'message': 'Service status updated successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@staff_member_required
@require_POST
@csrf_exempt
def assign_service_technician_api(request):
    """API endpoint for assigning technicians to services"""
    try:
        data = json.loads(request.body)
        service_id = data.get('service_id')
        technician_id = data.get('technician_id')
        
        service = get_object_or_404(ServiceRequest, id=service_id)
        technician = get_object_or_404(User, id=technician_id, role='TECHNICIAN')
        
        service.technician = technician
        if service.status == 'SUBMITTED':
            service.status = 'ASSIGNED'
        service.save()
        
        return JsonResponse({'success': True, 'message': 'Technician assigned successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})