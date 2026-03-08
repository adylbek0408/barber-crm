from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['barber', 'branch', 'service_name', 'price', 'payment_type', 'created_at']
    list_filter = ['branch__barbershop', 'payment_type', 'created_at']
    date_hierarchy = 'created_at'
