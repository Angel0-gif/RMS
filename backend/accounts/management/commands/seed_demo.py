"""
Seed demo accounts (and a Django superuser) for grading/demo purposes.
Idempotent: safe to run on every deploy. Usage: python manage.py seed_demo
"""
from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = 'Create demo manager/customer accounts and a superuser if they do not exist.'

    def handle(self, *args, **options):
        created = []

        if not User.objects.filter(email='admin@restaurant.com').exists():
            User.objects.create_user(
                username='admin', email='admin@restaurant.com', password='Admin@123',
                first_name='Admin', last_name='Manager', role='manager',
            )
            created.append('manager admin@restaurant.com')

        if not User.objects.filter(email='demo@restaurant.com').exists():
            User.objects.create_user(
                username='demo', email='demo@restaurant.com', password='Demo@123',
                first_name='Demo', last_name='Customer', role='customer',
            )
            created.append('customer demo@restaurant.com')

        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='superadmin', email='super@restaurant.com', password='Super@123',
                first_name='Super', last_name='Admin',
            )
            created.append('superuser super@restaurant.com (Django Admin)')

        if created:
            self.stdout.write(self.style.SUCCESS('Seeded: ' + ', '.join(created)))
        else:
            self.stdout.write('All demo accounts already exist. Nothing to do.')
