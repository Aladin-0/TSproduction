# users/management/commands/create_technician.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a technician account with email and password'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Technician email address')
        parser.add_argument('--name', type=str, required=True, help='Technician full name')
        parser.add_argument('--password', type=str, required=True, help='Technician password')
        parser.add_argument('--phone', type=str, help='Technician phone number (optional)')

    def handle(self, *args, **options):
        email = options['email']
        name = options['name']
        password = options['password']
        phone = options.get('phone', '')

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with email {email} already exists')
                )
                return

            # Create technician user
            user = User.objects.create_user(
                email=email,
                name=name,
                password=password,
                phone=phone,
                role='TECHNICIAN'
            )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully created technician account:')
            )
            self.stdout.write(f'  Email: {email}')
            self.stdout.write(f'  Name: {name}')
            self.stdout.write(f'  Password: {password}')
            if phone:
                self.stdout.write(f'  Phone: {phone}')
            
            self.stdout.write(
                self.style.WARNING('\nIMPORTANT: Please share these credentials securely with the technician!')
            )

        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating technician: {e}')
            )