from django.db import models
from apps.barbers.models import Barber, Service
from apps.barbershops.models import Branch


class Appointment(models.Model):
    PAYMENT_CASH = 'cash'
    PAYMENT_ONLINE = 'online'
    PAYMENT_CHOICES = [
        (PAYMENT_CASH, 'Наличные'),
        (PAYMENT_ONLINE, 'Онлайн'),
    ]

    barber = models.ForeignKey(
        Barber, on_delete=models.CASCADE, related_name='appointments'
    )
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name='appointments'
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, related_name='appointments'
    )
    service_name = models.CharField(max_length=200)  # Snapshot имени услуги
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot цены
    payment_type = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Запись'
        verbose_name_plural = 'Записи'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.barber} — {self.service_name} — {self.price} сом"

    def save(self, *args, **kwargs):
        # Автоматически сохраняем название и цену услуги
        if self.service and not self.service_name:
            self.service_name = self.service.name
        if self.service and not self.price:
            self.price = self.service.price
        super().save(*args, **kwargs)
