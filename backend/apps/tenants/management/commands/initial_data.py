from django.core.management.base import BaseCommand
from apps.tenants.models import Tenant, User
from apps.bot.models import BotConfig


class Command(BaseCommand):
    help = 'Create initial demo data: tenant, owner, bot config'

    def handle(self, *args, **options):
        tenant, created = Tenant.objects.get_or_create(
            slug='demo',
            defaults={'name': 'Demo Company', 'industry': 'Beauty'},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created tenant: {tenant.name}'))
        else:
            self.stdout.write(f'Tenant already exists: {tenant.name}')

        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@demo.com',
                'tenant': tenant,
                'role': User.Role.OWNER,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username} / admin123'))
        else:
            if user.tenant is None:
                user.tenant = tenant
                user.save()
                self.stdout.write(f'Assigned tenant to existing user: {user.username}')
            else:
                self.stdout.write(f'User already exists: {user.username}')

        bot, created = BotConfig.objects.get_or_create(
            tenant=tenant,
            defaults={
                'bot_name': 'Sales Assistant',
                'tone': 'friendly',
                'goal': 'Qualify leads, collect name and phone, recommend products',
                'greeting_template': 'Hi! Thanks for your interest. I\'m here to help you find the perfect solution. What are you looking for?',
                'escalation_trigger': 'Customer asks for manager, is unhappy, or needs specific pricing',
                'forbidden_topics': 'Competitors, discounts without manager approval',
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created bot config'))
        else:
            self.stdout.write('Bot config already exists')

        self.stdout.write(self.style.SUCCESS('\nDone! Login: admin / admin123'))
