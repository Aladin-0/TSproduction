# store/management/commands/add_sample_data.py
from django.core.management.base import BaseCommand
from store.models import ProductCategory, Product
from services.models import ServiceCategory, ServiceIssue

class Command(BaseCommand):
    help = 'Add sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        
        # Clear existing data
        Product.objects.all().delete()
        ProductCategory.objects.all().delete()
        ServiceIssue.objects.all().delete()
        ServiceCategory.objects.all().delete()
        
        self.stdout.write('Adding fresh sample data...')
        
        # Add Product Categories and Products
        laptop_category = ProductCategory.objects.create(
            name='Laptops',
            slug='laptops'
        )
        
        Product.objects.create(
            category=laptop_category,
            name='Gaming Laptop Pro',
            slug='gaming-laptop-pro',
            description='High-performance gaming laptop with RTX graphics',
            price='75000.00',
            stock=10
        )
        
        Product.objects.create(
            category=laptop_category,
            name='Business Laptop',
            slug='business-laptop',
            description='Professional laptop for business use',
            price='45000.00',
            stock=15
        )

        # Add another category
        printer_category = ProductCategory.objects.create(
            name='Printers',
            slug='printers'
        )
        
        Product.objects.create(
            category=printer_category,
            name='Laser Printer',
            slug='laser-printer',
            description='High-speed laser printer for office use',
            price='15000.00',
            stock=5
        )

        # Add Service Categories and Issues
        laptop_service = ServiceCategory.objects.create(
            name='Laptop Repair'
        )
        
        ServiceIssue.objects.create(
            category=laptop_service,
            description='Screen replacement',
            price='5000.00'
        )
        
        ServiceIssue.objects.create(
            category=laptop_service,
            description='Keyboard replacement',
            price='2000.00'
        )
        
        ServiceIssue.objects.create(
            category=laptop_service,
            description='Battery replacement',
            price='3000.00'
        )

        printer_service = ServiceCategory.objects.create(
            name='Printer Repair'
        )
        
        ServiceIssue.objects.create(
            category=printer_service,
            description='Paper jam fix',
            price='500.00'
        )
        
        ServiceIssue.objects.create(
            category=printer_service,
            description='Cartridge replacement',
            price='1500.00'
        )

        self.stdout.write(
            self.style.SUCCESS('Successfully added sample data')
        )