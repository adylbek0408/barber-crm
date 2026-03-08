from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    barber_name = serializers.CharField(source='barber.full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    payment_display = serializers.CharField(source='get_payment_type_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'barber', 'barber_name', 'branch', 'branch_name',
            'service', 'service_name', 'price', 'payment_type', 'payment_display',
            'created_at',
        ]
        read_only_fields = ['id', 'service_name', 'price', 'created_at']


class CreateAppointmentSerializer(serializers.ModelSerializer):
    """Барбер записывает стрижку — минимум полей"""

    class Meta:
        model = Appointment
        fields = ['service', 'payment_type']

    def create(self, validated_data):
        barber = self.context['request'].user.barber_profile
        service = validated_data['service']

        return Appointment.objects.create(
            barber=barber,
            branch=barber.branch,
            service=service,
            service_name=service.name,
            price=service.price,
            payment_type=validated_data['payment_type'],
        )
