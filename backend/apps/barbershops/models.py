from django.db import models
from apps.accounts.models import User


class Barbershop(models.Model):
    owner = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='barbershop',
        null=True, blank=True   # ← admin создаёт owner сам в save_model
    )
    name = models.CharField(max_length=200, verbose_name='Название')
    owner_name = models.CharField(max_length=200, verbose_name='Имя владельца')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    address = models.TextField(verbose_name='Адрес')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Барбершоп'
        verbose_name_plural = 'Барбершопы'

    def __str__(self):
        return self.name


class Subscription(models.Model):
    PLAN_TRIAL = 'trial'
    PLAN_BASIC = 'basic'
    PLAN_PRO = 'pro'
    PLAN_CHOICES = [
        (PLAN_TRIAL, 'Пробный'),
        (PLAN_BASIC, 'Базовый'),
        (PLAN_PRO, 'Про'),
    ]

    barbershop = models.OneToOneField(
        Barbershop, on_delete=models.CASCADE, related_name='subscription'
    )
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default=PLAN_TRIAL)
    started_at = models.DateField()
    expires_at = models.DateField()
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'

    def __str__(self):
        return f"{self.barbershop.name} — {self.get_plan_display()}"


class Branch(models.Model):
    barbershop = models.ForeignKey(
        Barbershop, on_delete=models.CASCADE, related_name='branches'
    )
    name = models.CharField(max_length=200, verbose_name='Название филиала')
    address = models.TextField(verbose_name='Адрес')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Филиал'
        verbose_name_plural = 'Филиалы'

    def __str__(self):
        return f"{self.barbershop.name} / {self.name}"
