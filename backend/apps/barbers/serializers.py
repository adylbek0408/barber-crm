from rest_framework import serializers
from .models import Barber, Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'barber', 'name', 'price', 'is_active']
        read_only_fields = ['id', 'barber']


class BarberSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = Barber
        fields = ['id', 'branch', 'branch_name', 'first_name', 'last_name',
                  'full_name', 'phone', 'is_active', 'created_at', 'services']
        read_only_fields = ['id', 'created_at']


class CreateBarberSerializer(serializers.ModelSerializer):
    """Создание барбера с автоматическим созданием User"""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Barber
        fields = ['branch', 'first_name', 'last_name', 'phone', 'username', 'password']

    def create(self, validated_data):
        from apps.accounts.models import User

        username = validated_data.pop('username')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.ROLE_BARBER,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        barber = Barber.objects.create(user=user, **validated_data)
        return barber
