from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = self.user.get_full_name()
        data['barbershop_has_shop_admin'] = False
        if self.user.is_barber():
            try:
                data['barbershop_has_shop_admin'] = self.user.barber_profile.branch.barbershop.has_shop_admin
            except Exception:
                pass
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    barbershop_has_shop_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'role', 'barbershop_has_shop_admin']
        read_only_fields = ['id', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_barbershop_has_shop_admin(self, obj):
        """Для барбера: True если записи ведёт администратор барбершопа (барбер не может создавать записи)."""
        if not obj.is_barber():
            return False
        try:
            return obj.barber_profile.branch.barbershop.has_shop_admin
        except Exception:
            return False
