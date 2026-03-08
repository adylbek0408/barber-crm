from django.db import models
from apps.barbershops.models import Branch


class Barber(models.Model):
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name='barbers'
    )
    # Связь с User для авторизации
    user = models.OneToOneField(
        'accounts.User', on_delete=models.CASCADE, related_name='barber_profile',
        null=True, blank=True
    )
    first_name = models.CharField(max_length=100, verbose_name='Имя')
    last_name = models.CharField(max_length=100, verbose_name='Фамилия')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Барбер'
        verbose_name_plural = 'Барберы'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Service(models.Model):
    barber = models.ForeignKey(
        Barber, on_delete=models.CASCADE, related_name='services'
    )
    name = models.CharField(max_length=200, verbose_name='Название услуги')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} — {self.price} сом"
