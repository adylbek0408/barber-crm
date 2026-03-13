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


class CreateAppointmentByShopAdminSerializer(serializers.ModelSerializer):
    """Администратор барбершопа создаёт запись: выбирает барбера, услугу, способ оплаты."""

    class Meta:
        model = Appointment
        fields = ['barber', 'service', 'payment_type']

    def get_fields(self):
        from apps.barbers.models import Barber, Service
        fields = super().get_fields()
        try:
            request = self.context.get('request')
            if request and getattr(request, 'user', None):
                barbershop = getattr(request.user, 'managed_barbershop', None)
                if barbershop:
                    fields['barber'].queryset = Barber.objects.filter(branch__barbershop=barbershop)
                    fields['service'].queryset = Service.objects.filter(
                        barber__branch__barbershop=barbershop, is_active=True
                    )
        except Exception:
            pass
        return fields

    def validate_barber(self, value):
        request = self.context.get('request')
        barbershop = getattr(request.user, 'managed_barbershop', None) if request else None
        if not barbershop:
            raise serializers.ValidationError('Нет привязанного барбершопа.')
        if value.branch.barbershop_id != barbershop.id:
            raise serializers.ValidationError('Барбер не из вашего барбершопа.')
        return value

    def validate_service(self, value):
        # validated_data ещё не заполнен во время полевой валидации — берём barber id из запроса
        barber_id = self.initial_data.get('barber')
        if barber_id is not None:
            try:
                barber_id = int(barber_id)
            except (TypeError, ValueError):
                pass
            else:
                if value.barber_id != barber_id:
                    raise serializers.ValidationError('Услуга не принадлежит выбранному барберу.')
        return value

    def create(self, validated_data):
        barber = validated_data['barber']
        service = validated_data['service']
        return Appointment.objects.create(
            barber=barber,
            branch=barber.branch,
            service=service,
            service_name=service.name,
            price=service.price,
            payment_type=validated_data['payment_type'],
        )
