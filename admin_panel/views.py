# admin_panel/views.py - FULLY FIXED with Real Data Connections
from services.models import JobSheet, JobSheetMaterial
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg, Q, F, DecimalField
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
from services.models import ServiceRequest, ServiceCategory, TechnicianRating, ServiceIssue
from users.models import CustomUser
from users.forms import CustomUserCreationForm
from django.views.decorators.http import require_http_methods

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
        
        # Basic stats - ALL REAL DATA
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
        
        # Recent orders - REAL DATA
        context['recent_orders'] = Order.objects.select_related('customer', 'technician').order_by('-order_date')[:10]
        
        # Recent services - REAL DATA
        context['recent_services'] = ServiceRequest.objects.select_related(
            'customer', 'technician', 'service_category'
        ).order_by('-request_date')[:10]
        
        # Monthly revenue - REAL DATA (calculated from OrderItems)
        try:
            current_month_revenue_data = OrderItem.objects.filter(
                order__order_date__gte=current_month_start,
                order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            ).aggregate(
                total=Sum(F('quantity') * F('price'), output_field=DecimalField())
            )
            current_month_revenue = float(current_month_revenue_data['total'] or 0)
        except:
            current_month_revenue = 0
        
        context['current_month_revenue'] = current_month_revenue
        
        # Top technicians by rating - REAL DATA
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
                
                # Handle additional images
                if 'additional_images' in request.FILES:
                    additional_images = request.FILES.getlist('additional_images')
                    for i, image_file in enumerate(additional_images[:10]):
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
                    if product.image:
                        product.image.delete()
                    product.image = request.FILES['new_main_image']
                
                product.save()
                
                # Handle removed images
                removed_images = request.POST.getlist('removed_images[]')
                for image_id in removed_images:
                    try:
                        image = ProductImage.objects.get(id=image_id, product=product)
                        image.delete()
                    except ProductImage.DoesNotExist:
                        pass
                
                # Handle new additional images
                if 'new_additional_images' in request.FILES:
                    existing_count = product.additional_images.count()
                    new_images = request.FILES.getlist('new_additional_images')
                    for i, image_file in enumerate(new_images[:10]):
                        ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            alt_text=f"{product.name} - Image {existing_count + i + 1}",
                            order=existing_count + i
                        )
                
                # Update specifications
                product.specifications.all().delete()
                
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
            product.delete()
            messages.success(request, f'Product "{product_name}" deleted successfully!')
        except Exception as e:
            messages.error(request, f'Error deleting product: {str(e)}')
        
        return redirect('admin_panel:products')

@method_decorator(staff_member_required, name='dispatch')
class AdminCreateUserView(View):
    def get(self, request):
        from users.forms import CustomUserCreationForm
        from services.models import ServiceCategory
        
        form = CustomUserCreationForm()
        service_categories = ServiceCategory.objects.all()
        
        return render(request, 'admin_panel/create_user.html', {
            'form': form,
            'service_categories': service_categories
        })
    
    def post(self, request):
        from users.forms import CustomUserCreationForm
        
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Set free service categories for AMC users
            if user.role == 'AMC':
                selected_categories = request.POST.getlist('free_service_categories')
                from services.models import ServiceCategory
                user.free_service_categories.set(
                    ServiceCategory.objects.filter(id__in=selected_categories)
                )
            
            messages.success(request, f'User "{user.name}" created successfully!')
            return redirect('admin_panel:users')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
        
        from services.models import ServiceCategory
        service_categories = ServiceCategory.objects.all()
        
        return render(request, 'admin_panel/create_user.html', {
            'form': form,
            'service_categories': service_categories
        })

@method_decorator(staff_member_required, name='dispatch')
class AdminEditUserView(View):
    def get(self, request, user_id):
        user_obj = get_object_or_404(User, id=user_id)
        
        from services.models import ServiceCategory
        service_categories = ServiceCategory.objects.all()
        
        context = {
            'user_obj': user_obj,
            'service_categories': service_categories
        }
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
            
            # Update free service categories for AMC users
            if user_obj.role == 'AMC':
                selected_categories = request.POST.getlist('free_service_categories')
                from services.models import ServiceCategory
                user_obj.free_service_categories.set(
                    ServiceCategory.objects.filter(id__in=selected_categories)
                )
            else:
                user_obj.free_service_categories.clear()
            
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

# ==================== ORDERS MANAGEMENT ====================
@method_decorator(staff_member_required, name='dispatch')
class AdminOrdersView(View):
    def get(self, request):
        status_filter = request.GET.get('status', '')
        technician_filter = request.GET.get('technician', '')
        search = request.GET.get('search', '')
        
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
        
        # REAL STATS
        all_orders = Order.objects.all()
        pending_count = all_orders.filter(status='PENDING').count()
        unassigned_count = all_orders.filter(technician__isnull=True).count()
        processing_count = all_orders.filter(status='PROCESSING').count()
        completed_count = all_orders.filter(status='DELIVERED').count()
        
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
            status = request.POST.get('status')
            if status:
                order.status = status

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

# ==================== SERVICES MANAGEMENT (FIXED WITH REAL DATA) ====================
@method_decorator(staff_member_required, name='dispatch')
class AdminServicesView(View):
    def get(self, request):
        status_filter = request.GET.get('status', '')
        technician_filter = request.GET.get('technician', '')
        category_filter = request.GET.get('category', '')
        search = request.GET.get('search', '')
        
        # UPDATE THIS LINE - Add prefetch_related for job_sheet
        services = ServiceRequest.objects.select_related(
            'customer', 'technician', 'service_category', 'service_location'
        ).prefetch_related('job_sheet')  # ADD THIS
        
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
        
        # REAL STATS - NOT MOCK DATA
        all_services = ServiceRequest.objects.all()
        submitted_count = all_services.filter(status='SUBMITTED').count()
        unassigned_count = all_services.filter(technician__isnull=True).count()
        in_progress_count = all_services.filter(status='IN_PROGRESS').count()
        completed_count = all_services.filter(status='COMPLETED').count()
        
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
            # REAL STATS
            'submitted_count': submitted_count,
            'unassigned_count': unassigned_count,
            'in_progress_count': in_progress_count,
            'completed_count': completed_count,
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

# ==================== CATEGORIES MANAGEMENT (FIXED) ====================
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
        
        if not name or not name.strip():
            messages.error(request, 'Category name is required')
            return redirect('admin_panel:categories')
        
        try:
            if category_type == 'product':
                if not slug or not slug.strip():
                    slug = slugify(name)
                
                # Check if slug exists and make it unique
                original_slug = slug
                counter = 1
                while ProductCategory.objects.filter(slug=slug).exists():
                    slug = f"{original_slug}-{counter}"
                    counter += 1
                
                ProductCategory.objects.create(name=name.strip(), slug=slug)
                messages.success(request, f'Product category "{name}" created successfully!')
            
            elif category_type == 'service':
                # Create service category
                service_category = ServiceCategory.objects.create(name=name.strip())
                
                # Get service issues from form
                issue_descriptions = request.POST.getlist('issue_descriptions[]')
                issue_prices = request.POST.getlist('issue_prices[]')
                
                # Create service issues
                created_issues = 0
                for description, price in zip(issue_descriptions, issue_prices):
                    if description.strip():
                        try:
                            # Convert price to decimal, default to 0 if empty
                            price_value = float(price) if price.strip() else 0
                            ServiceIssue.objects.create(
                                category=service_category,
                                description=description.strip(),
                                price=price_value
                            )
                            created_issues += 1
                        except ValueError:
                            messages.warning(request, f'Invalid price for issue "{description}". Set to 0.')
                            ServiceIssue.objects.create(
                                category=service_category,
                                description=description.strip(),
                                price=0
                            )
                            created_issues += 1
                
                messages.success(request, f'Service category "{name}" created with {created_issues} issues!')
            else:
                messages.error(request, 'Invalid category type')
            
        except Exception as e:
            messages.error(request, f'Error creating category: {str(e)}')
        
        return redirect('admin_panel:categories')

@method_decorator(staff_member_required, name='dispatch')
class AdminEditCategoryView(View):
    def get(self, request, category_id):
        """Show edit form for service categories with issues"""
        category_type = request.GET.get('type', 'product')
        
        if category_type == 'service':
            category = get_object_or_404(ServiceCategory, id=category_id)
            issues = category.issues.all()
            
            context = {
                'category': category,
                'issues': issues,
                'category_type': 'service'
            }
            return render(request, 'admin_panel/edit_service_category.html', context)
        else:
            # For product categories, handle in template modal
            return redirect('admin_panel:categories')
    
    def post(self, request, category_id):
        category_type = request.POST.get('type')
        name = request.POST.get('name')
        slug = request.POST.get('slug', '')
        
        if not name or not name.strip():
            messages.error(request, 'Category name is required')
            return redirect('admin_panel:categories')
        
        try:
            if category_type == 'product':
                category = get_object_or_404(ProductCategory, id=category_id)
                category.name = name.strip()
                if slug and slug.strip():
                    category.slug = slug.strip()
                category.save()
                messages.success(request, f'Product category "{name}" updated successfully!')
            
            elif category_type == 'service':
                category = get_object_or_404(ServiceCategory, id=category_id)
                category.name = name.strip()
                category.save()
                
                # Get existing issue IDs to keep
                existing_issue_ids = request.POST.getlist('existing_issue_ids[]')
                
                # Delete issues that are not in the existing list
                category.issues.exclude(id__in=existing_issue_ids).delete()
                
                # Update existing issues
                existing_descriptions = request.POST.getlist('existing_issue_descriptions[]')
                existing_prices = request.POST.getlist('existing_issue_prices[]')
                
                for issue_id, description, price in zip(existing_issue_ids, existing_descriptions, existing_prices):
                    if description.strip():
                        try:
                            issue = ServiceIssue.objects.get(id=issue_id, category=category)
                            issue.description = description.strip()
                            issue.price = float(price) if price.strip() else 0
                            issue.save()
                        except (ServiceIssue.DoesNotExist, ValueError):
                            pass
                
                # Add new issues
                new_descriptions = request.POST.getlist('new_issue_descriptions[]')
                new_prices = request.POST.getlist('new_issue_prices[]')
                
                for description, price in zip(new_descriptions, new_prices):
                    if description.strip():
                        try:
                            price_value = float(price) if price.strip() else 0
                            ServiceIssue.objects.create(
                                category=category,
                                description=description.strip(),
                                price=price_value
                            )
                        except ValueError:
                            ServiceIssue.objects.create(
                                category=category,
                                description=description.strip(),
                                price=0
                            )
                
                messages.success(request, f'Service category "{name}" updated successfully!')
            
        except Exception as e:
            messages.error(request, f'Error updating category: {str(e)}')
        
        return redirect('admin_panel:categories')

@method_decorator(staff_member_required, name='dispatch')
class AdminDeleteCategoryView(View):
    def post(self, request, category_id):
        category_type = request.POST.get('type', 'product')
        
        try:
            if category_type == 'product':
                category = get_object_or_404(ProductCategory, id=category_id)
                category_name = category.name
                
                # Check if category has products
                product_count = category.products.count()
                if product_count > 0:
                    messages.warning(
                        request, 
                        f'Cannot delete category "{category_name}" because it has {product_count} associated products. Please reassign or delete those products first.'
                    )
                    return redirect('admin_panel:categories')
                
                category.delete()
                messages.success(request, f'Product category "{category_name}" deleted successfully!')
            
            elif category_type == 'service':
                category = get_object_or_404(ServiceCategory, id=category_id)
                category_name = category.name
                
                # Check if category has services
                service_count = category.servicerequest_set.count()
                if service_count > 0:
                    messages.warning(
                        request, 
                        f'Cannot delete category "{category_name}" because it has {service_count} associated service requests. Please reassign or delete those services first.'
                    )
                    return redirect('admin_panel:categories')
                
                category.delete()
                messages.success(request, f'Service category "{category_name}" deleted successfully!')
            
            else:
                messages.error(request, 'Invalid category type')
                
        except Exception as e:
            messages.error(request, f'Error deleting category: {str(e)}')
        
        return redirect('admin_panel:categories')

# ==================== ANALYTICS (FULLY CONNECTED WITH REAL DATA) ====================
@method_decorator(staff_member_required, name='dispatch')
class AdminAnalyticsView(TemplateView):
    template_name = 'admin_panel/analytics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get date range from query params (default 30 days)
        days = int(self.request.GET.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Previous period for comparison
        previous_start = start_date - timedelta(days=days)
        previous_end = start_date
        
        # Current period data
        current_orders = Order.objects.filter(order_date__range=[start_date, end_date])
        previous_orders = Order.objects.filter(order_date__range=[previous_start, previous_end])
        
        # Calculate revenue from order items (REAL DATA)
        current_revenue_data = OrderItem.objects.filter(
            order__order_date__range=[start_date, end_date],
            order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).aggregate(
            total=Sum(F('quantity') * F('price'), output_field=DecimalField())
        )
        current_revenue = float(current_revenue_data['total'] or 0)
        
        previous_revenue_data = OrderItem.objects.filter(
            order__order_date__range=[previous_start, previous_end],
            order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).aggregate(
            total=Sum(F('quantity') * F('price'), output_field=DecimalField())
        )
        previous_revenue = float(previous_revenue_data['total'] or 0)
        
        # Calculate growth percentages
        revenue_growth = 0
        if previous_revenue > 0:
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
        elif current_revenue > 0:
            revenue_growth = 100
        
        order_growth = 0
        if previous_orders.count() > 0:
            order_growth = ((current_orders.count() - previous_orders.count()) / previous_orders.count()) * 100
        elif current_orders.count() > 0:
            order_growth = 100
        
        # Average order value
        avg_order_value = current_revenue / current_orders.count() if current_orders.count() > 0 else 0
        prev_avg_order_value = previous_revenue / previous_orders.count() if previous_orders.count() > 0 else 0
        
        aov_growth = 0
        if prev_avg_order_value > 0:
            aov_growth = ((avg_order_value - prev_avg_order_value) / prev_avg_order_value) * 100
        elif avg_order_value > 0:
            aov_growth = 100
        
        # Customer growth
        current_customers = User.objects.filter(
            role='CUSTOMER',
            date_joined__range=[start_date, end_date]
        ).count()
        
        previous_customers = User.objects.filter(
            role='CUSTOMER',
            date_joined__range=[previous_start, previous_end]
        ).count()
        
        customer_growth = 0
        if previous_customers > 0:
            customer_growth = ((current_customers - previous_customers) / previous_customers) * 100
        elif current_customers > 0:
            customer_growth = 100
        
        # Monthly revenue data for chart (last 12 months) - REAL DATA
        monthly_revenue = []
        for i in range(11, -1, -1):
            month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            
            revenue_data = OrderItem.objects.filter(
                order__order_date__range=[month_start, month_end],
                order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            ).aggregate(
                total=Sum(F('quantity') * F('price'), output_field=DecimalField())
            )
            revenue = float(revenue_data['total'] or 0)
            
            monthly_revenue.append({
                'month': month_start.strftime('%b %y'),
                'amount': revenue
            })
        
        # Daily orders for last 30 days - REAL DATA
        daily_orders = []
        for i in range(29, -1, -1):
            day = timezone.now().date() - timedelta(days=i)
            day_start = timezone.make_aware(datetime.combine(day, datetime.min.time()))
            day_end = timezone.make_aware(datetime.combine(day, datetime.max.time()))
            
            count = Order.objects.filter(order_date__range=[day_start, day_end]).count()
            daily_orders.append({
                'day': day.strftime('%m/%d'),
                'count': count
            })
        
        # Daily services for last 30 days - REAL DATA
        daily_services = []
        for i in range(29, -1, -1):
            day = timezone.now().date() - timedelta(days=i)
            day_start = timezone.make_aware(datetime.combine(day, datetime.min.time()))
            day_end = timezone.make_aware(datetime.combine(day, datetime.max.time()))
            
            count = ServiceRequest.objects.filter(request_date__range=[day_start, day_end]).count()
            daily_services.append({
                'day': day.strftime('%m/%d'),
                'count': count
            })
        
        # Top products by sales - REAL DATA
        top_products = OrderItem.objects.filter(
            order__order_date__range=[start_date, end_date]
        ).values('product__name').annotate(
            total_quantity=Sum('quantity'),
            total_sales=Sum(F('quantity') * F('price'), output_field=DecimalField())
        ).order_by('-total_sales')[:5]
        
        # Order status distribution - REAL DATA
        total_orders_count = Order.objects.filter(order_date__range=[start_date, end_date]).count()
        order_status_distribution = []
        
        for status_code, status_name in Order.STATUS_CHOICES:
            count = Order.objects.filter(
                order_date__range=[start_date, end_date],
                status=status_code
            ).count()
            
            percentage = (count / total_orders_count * 100) if total_orders_count > 0 else 0
            
            if count > 0:
                order_status_distribution.append({
                    'status': status_name,
                    'count': count,
                    'percentage': percentage
                })
        
        # Top cities by orders - REAL DATA
        top_cities = Order.objects.filter(
            order_date__range=[start_date, end_date],
            shipping_address__isnull=False
        ).values('shipping_address__city', 'shipping_address__state').annotate(
            order_count=Count('id')
        ).order_by('-order_count')[:5]
        
        # Recent activities - REAL DATA
        recent_activities = []
        
        # Recent orders
        recent_order = Order.objects.select_related('customer').order_by('-order_date').first()
        if recent_order:
            time_diff = timezone.now() - recent_order.order_date
            if time_diff.days > 0:
                time_ago = f'{time_diff.days} day{"s" if time_diff.days > 1 else ""} ago'
            elif time_diff.seconds // 3600 > 0:
                hours = time_diff.seconds // 3600
                time_ago = f'{hours} hour{"s" if hours > 1 else ""} ago'
            else:
                minutes = time_diff.seconds // 60
                time_ago = f'{minutes} minute{"s" if minutes > 1 else ""} ago'
            
            recent_activities.append({
                'icon': 'shopping-cart',
                'color': '16, 185, 129',
                'title': 'New order placed',
                'description': f'Order #{recent_order.id} by {recent_order.customer.name}',
                'time': time_ago
            })
        
        # Recent customers
        recent_customer = User.objects.filter(role='CUSTOMER').order_by('-date_joined').first()
        if recent_customer:
            time_diff = timezone.now() - recent_customer.date_joined
            if time_diff.days > 0:
                time_ago = f'{time_diff.days} day{"s" if time_diff.days > 1 else ""} ago'
            elif time_diff.seconds // 3600 > 0:
                hours = time_diff.seconds // 3600
                time_ago = f'{hours} hour{"s" if hours > 1 else ""} ago'
            else:
                minutes = time_diff.seconds // 60
                time_ago = f'{minutes} minute{"s" if minutes > 1 else ""} ago'
            
            recent_activities.append({
                'icon': 'user-plus',
                'color': '59, 130, 246',
                'title': 'New customer registered',
                'description': f'{recent_customer.name}',
                'time': time_ago
            })
        
        # Recent service
        recent_service = ServiceRequest.objects.select_related('customer').order_by('-request_date').first()
        if recent_service:
            time_diff = timezone.now() - recent_service.request_date
            if time_diff.days > 0:
                time_ago = f'{time_diff.days} day{"s" if time_diff.days > 1 else ""} ago'
            elif time_diff.seconds // 3600 > 0:
                hours = time_diff.seconds // 3600
                time_ago = f'{hours} hour{"s" if hours > 1 else ""} ago'
            else:
                minutes = time_diff.seconds // 60
                time_ago = f'{minutes} minute{"s" if minutes > 1 else ""} ago'
            
            recent_activities.append({
                'icon': 'tools',
                'color': '168, 85, 247',
                'title': 'Service request submitted',
                'description': f'Request #{recent_service.id}',
                'time': time_ago
            })
        
        # Low stock products
        low_stock = Product.objects.filter(stock__lt=5, stock__gt=0).first()
        if low_stock:
            recent_activities.append({
                'icon': 'exclamation-triangle',
                'color': '239, 68, 68',
                'title': 'Low stock alert',
                'description': f'{low_stock.name} - {low_stock.stock} left',
                'time': 'Now'
            })
        
        context.update({
            # Summary stats - ALL REAL
            'total_revenue': current_revenue,
            'revenue_growth': revenue_growth,
            'total_orders': current_orders.count(),
            'order_growth': order_growth,
            'avg_order_value': avg_order_value,
            'aov_growth': aov_growth,
            'total_customers': User.objects.filter(role='CUSTOMER').count(),
            'customer_growth': customer_growth,
            
            # Chart data (JSON serialized) - ALL REAL
            'monthly_revenue': json.dumps(monthly_revenue),
            'daily_orders': json.dumps(daily_orders),
            'daily_services': json.dumps(daily_services),
            
            # Lists - ALL REAL
            'top_products': top_products,
            'order_status_distribution': order_status_distribution,
            'top_cities': top_cities,
            'recent_activities': recent_activities,
        })
        
        return context

@method_decorator(staff_member_required, name='dispatch')
class AdminSettingsView(TemplateView):
    template_name = 'admin_panel/settings.html'

# ==================== API VIEWS FOR AJAX ====================
@staff_member_required
def admin_stats_api(request):
    """API endpoint for dashboard stats - REAL DATA"""
    try:
        # Calculate real revenue from OrderItems
        revenue_data = OrderItem.objects.filter(
            order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).aggregate(
            total=Sum(F('quantity') * F('price'), output_field=DecimalField())
        )
        total_revenue = float(revenue_data['total'] or 0)
        
        stats = {
            'total_users': User.objects.count(),
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(status='PENDING').count(),
            'total_revenue': total_revenue,
        }
        return JsonResponse(stats)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@staff_member_required
def get_order_details_api(request, order_id):
    """API endpoint for getting order details - REAL DATA"""
    try:
        order = get_object_or_404(
            Order.objects.select_related('customer', 'technician', 'shipping_address').prefetch_related('items__product'),
            id=order_id
        )
        
        # Calculate total from OrderItems
        items_data = []
        total_amount = 0
        for item in order.items.all():
            item_total = float(item.price) * item.quantity
            total_amount += item_total
            items_data.append({
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': str(item.price),
                'total': str(item_total)
            })
        
        order_data = {
            'id': order.id,
            'status': order.status,
            'total_amount': str(total_amount),
            'order_date': order.order_date.strftime('%B %d, %Y at %I:%M %p'),
            'customer': {
                'name': order.customer.name,
                'email': order.customer.email,
                'phone': order.customer.phone or 'N/A'
            },
            'technician': order.technician.name if order.technician else None,
            'shipping_address': str(order.shipping_address) if order.shipping_address else 'N/A',
            'items': items_data
        }
        
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
    """API endpoint for assigning technicians to orders"""
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

@method_decorator(staff_member_required, name='dispatch')
class AdminJobSheetsView(View):
    def get(self, request):
        # Get filter parameters
        approval_filter = request.GET.get('approval', '')
        technician_filter = request.GET.get('technician', '')
        search = request.GET.get('search', '')
        
        # Build queryset
        job_sheets = JobSheet.objects.select_related(
            'service_request',
            'service_request__customer',
            'service_request__service_category',
            'created_by'
        ).prefetch_related('materials')
        
        if approval_filter:
            job_sheets = job_sheets.filter(approval_status=approval_filter)
        
        if technician_filter:
            job_sheets = job_sheets.filter(created_by_id=technician_filter)
        
        if search:
            job_sheets = job_sheets.filter(
                Q(id__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(service_request__id__icontains=search) |
                Q(equipment_type__icontains=search)
            )
        
        job_sheets = job_sheets.order_by('-created_at')
        
        # REAL STATS
        all_job_sheets = JobSheet.objects.all()
        pending_count = all_job_sheets.filter(approval_status='PENDING').count()
        approved_count = all_job_sheets.filter(approval_status='APPROVED').count()
        declined_count = all_job_sheets.filter(approval_status='DECLINED').count()
        
        # Pagination
        paginator = Paginator(job_sheets, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'job_sheets': page_obj,
            'technicians': User.objects.filter(role='TECHNICIAN'),
            'approval_choices': JobSheet.APPROVAL_STATUS,
            'approval_filter': approval_filter,
            'technician_filter': technician_filter,
            'search': search,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'declined_count': declined_count,
            'total_count': all_job_sheets.count(),
        }
        
        return render(request, 'admin_panel/job_sheets.html', context)


@method_decorator(staff_member_required, name='dispatch')
class AdminJobSheetDetailView(View):
    def get(self, request, job_sheet_id):
        job_sheet = get_object_or_404(
            JobSheet.objects.select_related(
                'service_request',
                'service_request__customer',
                'service_request__service_category',
                'service_request__service_location',
                'created_by'
            ).prefetch_related('materials'),
            id=job_sheet_id
        )
        
        # Calculate total material cost
        total_material_cost = sum(
            material.total_cost for material in job_sheet.materials.all()
        )
        
        context = {
            'job_sheet': job_sheet,
            'total_material_cost': total_material_cost,
        }
        
        return render(request, 'admin_panel/job_sheet_detail.html', context)


@method_decorator(staff_member_required, name='dispatch')
class AdminDeleteJobSheetView(View):
    def post(self, request, job_sheet_id):
        job_sheet = get_object_or_404(JobSheet, id=job_sheet_id)
        job_sheet_number = job_sheet.id
        
        try:
            job_sheet.delete()
            messages.success(request, f'Job Sheet #{job_sheet_number} deleted successfully!')
        except Exception as e:
            messages.error(request, f'Error deleting job sheet: {str(e)}')
        
        return redirect('admin_panel:job_sheets')


# ==================== JOB SHEET API ENDPOINTS ====================
@staff_member_required
def get_job_sheet_details_api(request, job_sheet_id):
    """API endpoint for getting job sheet details"""
    try:
        job_sheet = get_object_or_404(
            JobSheet.objects.select_related(
                'service_request',
                'service_request__customer',
                'created_by'
            ).prefetch_related('materials'),
            id=job_sheet_id
        )
        
        # Calculate total material cost
        total_material_cost = sum(
            float(material.total_cost) for material in job_sheet.materials.all()
        )
        
        job_sheet_data = {
            'id': job_sheet.id,
            'service_request_id': job_sheet.service_request.id,
            'customer_name': job_sheet.customer_name,
            'customer_contact': job_sheet.customer_contact,
            'service_address': job_sheet.service_address,
            'equipment_type': job_sheet.equipment_type,
            'serial_number': job_sheet.serial_number,
            'equipment_brand': job_sheet.equipment_brand,
            'equipment_model': job_sheet.equipment_model,
            'problem_description': job_sheet.problem_description,
            'work_performed': job_sheet.work_performed,
            'date_of_service': job_sheet.date_of_service.strftime('%Y-%m-%d'),
            'start_time': job_sheet.start_time.strftime('%H:%M'),
            'finish_time': job_sheet.finish_time.strftime('%H:%M'),
            'total_time_taken': str(job_sheet.total_time_taken) if job_sheet.total_time_taken else None,
            'approval_status': job_sheet.approval_status,
            'declined_reason': job_sheet.declined_reason,
            'technician_name': job_sheet.created_by.name,
            'technician_phone': job_sheet.created_by.phone,
            'created_at': job_sheet.created_at.strftime('%B %d, %Y at %I:%M %p'),
            'materials': [
                {
                    'date_used': material.date_used.strftime('%Y-%m-%d'),
                    'item_description': material.item_description,
                    'quantity': str(material.quantity),
                    'unit_cost': str(material.unit_cost),
                    'total_cost': str(material.total_cost),
                }
                for material in job_sheet.materials.all()
            ],
            'total_material_cost': str(total_material_cost),
        }
        
        return JsonResponse({
            'success': True,
            'job_sheet': job_sheet_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@require_http_methods(["GET"])
@staff_member_required
def api_get_service_detail(request, service_id):
    """Get service details as JSON"""
    try:
        service = ServiceRequest.objects.select_related(
            'customer', 'service_category', 'issue', 'service_location', 'technician'
        ).get(id=service_id)
        
        data = {
            'id': service.id,
            'customer': {
                'name': service.customer.name,
                'email': service.customer.email,
                'phone': service.customer.phone or '',
            },
            'service_category': {
                'name': service.service_category.name
            },
            'issue': {
                'description': service.issue.description,
                'price': str(service.issue.price)
            } if service.issue else None,
            'custom_description': service.custom_description,
            'service_location': {
                'street_address': service.service_location.street_address,
                'city': service.service_location.city,
                'state': service.service_location.state,
                'pincode': service.service_location.pincode,
            },
            'request_date': service.request_date.isoformat(),
            'status': service.status,
            'technician': {
                'name': service.technician.name
            } if service.technician else None
        }
        
        return JsonResponse(data)
    except ServiceRequest.DoesNotExist:
        return JsonResponse({'error': 'Service not found'}, status=404)
    