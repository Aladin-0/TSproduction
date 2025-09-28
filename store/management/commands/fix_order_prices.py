# store/management/commands/fix_order_prices.py
# Create this file in your Django app to fix existing orders with None prices

from django.core.management.base import BaseCommand
from store.models import OrderItem
from decimal import Decimal

class Command(BaseCommand):
    help = 'Fix OrderItems with None prices by setting them to their product prices'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be fixed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find OrderItems with None prices
        items_with_none_price = OrderItem.objects.filter(price__isnull=True)
        
        if not items_with_none_price.exists():
            self.stdout.write(
                self.style.SUCCESS('No OrderItems with None prices found. All good!')
            )
            return

        self.stdout.write(
            f'Found {items_with_none_price.count()} OrderItems with None prices'
        )

        fixed_count = 0
        error_count = 0

        for item in items_with_none_price:
            try:
                if item.product and item.product.price:
                    old_price = item.price
                    new_price = item.product.price
                    
                    if not dry_run:
                        item.price = new_price
                        item.save(update_fields=['price'])
                    
                    self.stdout.write(
                        f'OrderItem {item.id}: {old_price} → ₹{new_price} '
                        f'(Product: {item.product.name})'
                    )
                    fixed_count += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'OrderItem {item.id}: Cannot fix - '
                            f'Product {"missing" if not item.product else "has no price"}'
                        )
                    )
                    error_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error fixing OrderItem {item.id}: {e}'
                    )
                )
                error_count += 1

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n=== DRY RUN COMPLETE ===\n'
                    f'Would fix: {fixed_count} items\n'
                    f'Errors: {error_count} items\n'
                    f'Run without --dry-run to apply changes'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n=== REPAIR COMPLETE ===\n'
                    f'Fixed: {fixed_count} items\n'
                    f'Errors: {error_count} items'
                )
            )

        # Also check for any remaining issues
        remaining_issues = OrderItem.objects.filter(price__isnull=True)
        if remaining_issues.exists():
            self.stdout.write(
                self.style.WARNING(
                    f'\nWarning: {remaining_issues.count()} OrderItems still have None prices'
                )
            )