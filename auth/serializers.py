from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

class EmailTokenObtainSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciales incorrectas")

        user = authenticate(
            username=user.username,
            password=password
        )

        if not user:
            raise serializers.ValidationError("Credenciales incorrectas")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
