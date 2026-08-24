from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import Department, User


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source="head.get_full_name", read_only=True, default="")

    class Meta:
        model = Department
        fields = ["id", "name", "head", "head_name", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True, default="")

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "department", "department_name", "phone",
            "is_active_employee", "is_active", "date_joined",
        ]
        read_only_fields = ["date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "department", "phone", "password",
        ]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value
