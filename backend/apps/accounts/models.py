from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_PLATFORM_ADMIN = 'platform_admin'
    ROLE_OWNER = 'owner'
    ROLE_BARBER = 'barber'
    ROLE_SHOP_ADMIN = 'shop_admin'

    ROLE_CHOICES = [
        (ROLE_PLATFORM_ADMIN, 'Администратор платформы'),
        (ROLE_OWNER, 'Владелец барбершопа'),
        (ROLE_BARBER, 'Барбер'),
        (ROLE_SHOP_ADMIN, 'Администратор барбершопа'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_BARBER)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def is_platform_admin(self):
        return self.role == self.ROLE_PLATFORM_ADMIN

    def is_owner(self):
        return self.role == self.ROLE_OWNER

    def is_barber(self):
        return self.role == self.ROLE_BARBER

    def is_shop_admin(self):
        return self.role == self.ROLE_SHOP_ADMIN
