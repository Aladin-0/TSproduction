# Create this file: users/management/commands/setup_google_auth.py

import os
from django.core.management.base import BaseCommand
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

class Command(BaseCommand):
    help = 'Setup Google OAuth authentication'

    def add_arguments(self, parser):
        parser.add_argument('--client-id', type=str, required=True, help='Google OAuth Client ID')
        parser.add_argument('--client-secret', type=str, required=True, help='Google OAuth Client Secret')

    def handle(self, *args, **options):
        client_id = options['client_id']
        client_secret = options['client_secret']

        # Create or update Google social app
        google_app, created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google',
                'client_id': client_id,
                'secret': client_secret,
            }
        )

        if not created:
            google_app.client_id = client_id
            google_app.secret = client_secret
            google_app.save()

        # Add to site
        site = Site.objects.get_current()
        google_app.sites.add(site)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully {"created" if created else "updated"} Google OAuth app'
            )
        )

        