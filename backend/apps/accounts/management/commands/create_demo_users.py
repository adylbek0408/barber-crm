"""
Создаёт демо-пользователей: платформ-админ, владелец барбершопа и барбер.
Использование: python manage.py create_demo_users
"""
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.barbershops.models import Barbershop, Branch, Subscription
from apps.barbers.models import Barber


class Command(BaseCommand):
    help = 'Создаёт демо-пользователей (platform_admin, owner, barber) с тестовыми данными'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Не спрашивать подтверждение',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if not options['no_input'] and User.objects.exists():
            if input('В БД уже есть пользователи. Создать ещё? (y/n): ').lower() != 'y':
                self.stdout.write('Отменено.')
                return

        # 1. Платформ-админ (доступ в Django Admin и к API для управления барбершопами)
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'first_name': 'Администратор',
                'last_name': 'Платформы',
                'email': 'admin@barbercrm.local',
                'role': User.ROLE_PLATFORM_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        if created:
            admin_user.set_password('Admin123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Создан платформ-админ: admin / Admin123!'))
        else:
            self.stdout.write('Пользователь admin уже существует.')

        # 2. Владелец + барбершоп + филиал + подписка
        owner_user, created = User.objects.get_or_create(
            username='owner',
            defaults={
                'first_name': 'Иван',
                'last_name': 'Владельцев',
                'email': 'owner@barbercrm.local',
                'role': User.ROLE_OWNER,
                'is_staff': False,
                'is_superuser': False,
                'is_active': True,
            },
        )
        if created:
            owner_user.set_password('Owner123!')
            owner_user.save()

        barbershop, bs_created = Barbershop.objects.get_or_create(
            owner=owner_user,
            defaults={
                'name': 'Демо Барбершоп',
                'owner_name': 'Иван Владельцев',
                'phone': '+996500123456',
                'address': 'г. Бишкек, ул. Демо, 1',
                'is_active': True,
            },
        )
        if bs_created:
            Subscription.objects.create(
                barbershop=barbershop,
                plan=Subscription.PLAN_TRIAL,
                started_at=date.today(),
                expires_at=date.today() + timedelta(days=30),
                is_paid=False,
            )
            self.stdout.write(self.style.SUCCESS('Создан владелец и барбершоп: owner / Owner123!'))
        else:
            self.stdout.write('Владелец/барбершоп уже существуют.')

        branch = Branch.objects.filter(barbershop=barbershop).first()
        if not branch:
            branch = Branch.objects.create(
                barbershop=barbershop,
                name='Центральный филиал',
                address=barbershop.address,
                is_active=True,
            )

        # 3. Барбер (привязан к филиалу и пользователю)
        barber_user, barber_user_created = User.objects.get_or_create(
            username='barber',
            defaults={
                'first_name': 'Петр',
                'last_name': 'Барберов',
                'email': 'barber@barbercrm.local',
                'role': User.ROLE_BARBER,
                'is_staff': False,
                'is_superuser': False,
                'is_active': True,
            },
        )
        if barber_user_created:
            barber_user.set_password('Barber123!')
            barber_user.save()
        Barber.objects.get_or_create(
            user=barber_user,
            defaults={
                'branch': branch,
                'first_name': barber_user.first_name,
                'last_name': barber_user.last_name,
                'phone': '+996500654321',
                'is_active': True,
            },
        )
        if barber_user_created or bs_created:
            self.stdout.write(self.style.SUCCESS('Создан барбер: barber / Barber123!'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Доступы для входа ==='))
        self.stdout.write('  Платформ-админ:  admin  / Admin123!  (Django Admin + API)')
        self.stdout.write('  Владелец:       owner  / Owner123!   (кабинет владельца)')
        self.stdout.write('  Барбер:         barber / Barber123!  (кабинет барбера)')
        self.stdout.write('  Сайт:           http://localhost:3000/')
        self.stdout.write('  API/Admin:      http://localhost:8000/admin/')
