import secrets
import string

from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import serializers

from .models import CustomUser, Institute


class InstituteRegisterSerializer(serializers.Serializer):
    # Incoming payload for institute + admin creation.
    institute_name = serializers.CharField(max_length=255, allow_blank=False, trim_whitespace=True)
    institute_code = serializers.CharField(max_length=50, required=False)
    
    # Branding & Description
    description = serializers.CharField(required=False, allow_blank=True)
    primary_color = serializers.CharField(max_length=20, required=False)
    
    # Contact
    website = serializers.URLField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    # Schedule
    academic_year = serializers.CharField(required=False, allow_blank=True)
    semester = serializers.CharField(required=False, allow_blank=True)
    
    # Admin Info
    admin_name = serializers.CharField(max_length=255, allow_blank=False, trim_whitespace=True)
    admin_email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6, trim_whitespace=False)

    def validate_admin_email(self, value: str) -> str:
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def _generate_unique_institute_code(self, name, length: int = 10) -> str:
        # If user didn't provide a code, generate one from name or random
        base = name.lower().replace(" ", "-")[:length]
        if not Institute.objects.filter(institute_code=base).exists():
            return base
            
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(20):
            suffix = "".join(secrets.choice(alphabet) for _ in range(4))
            code = f"{base}-{suffix}"
            if not Institute.objects.filter(institute_code=code).exists():
                return code
        raise serializers.ValidationError("Could not generate a unique institute code. Please retry.")

    @transaction.atomic
    def create(self, validated_data):
        code = validated_data.get("institute_code")
        if not code:
            code = self._generate_unique_institute_code(validated_data["institute_name"])
            
        institute = Institute.objects.create(
            name=validated_data["institute_name"],
            institute_code=code,
            description=validated_data.get("description"),
            primary_color=validated_data.get("primary_color", "#2196F3"),
            website=validated_data.get("website"),
            contact_email=validated_data.get("contact_email"),
            phone=validated_data.get("phone"),
            address=validated_data.get("address"),
            academic_year=validated_data.get("academic_year"),
            semester=validated_data.get("semester"),
        )

        admin_user = CustomUser.objects.create_user(
            email=validated_data["admin_email"],
            full_name=validated_data["admin_name"],
            password=validated_data["password"],
            role=CustomUser.Role.ADMIN,
            institute=institute,
            is_active=True,
        )

        return {"institute": institute, "admin_user": admin_user}


class LoginSerializer(serializers.Serializer):
    # Basic email/password login payload.
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        # Use Django's auth system with CustomUser.USERNAME_FIELD = 'email'.
        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid credentials or inactive account.")

        attrs["user"] = user
        return attrs


class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "full_name", "email", "role", "institute_id")


class CreateUserSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=CustomUser.Role.choices)
    password = serializers.CharField(write_only=True, min_length=6, trim_whitespace=False)
    institute_id = serializers.IntegerField()

    def validate_email(self, value: str) -> str:
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")
        if user.institute_id is None:
            raise serializers.ValidationError("Admin is not attached to an institute.")

        # Ensure admins can only manage users in their own institute.
        if attrs.get("institute_id") != user.institute_id:
            raise serializers.ValidationError("You can only create users in your own institute.")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        institute = request.user.institute

        return CustomUser.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
            role=validated_data["role"],
            institute=institute,
            is_active=True,
        )


class ForgotPasswordSerializer(serializers.Serializer):
    """Validates that the provided email belongs to an existing user."""

    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        if not CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("No account found with this email address.")
        return value


class VerifyResetCodeSerializer(serializers.Serializer):
    """Validates that the code matches, is not expired, and has not been used."""

    email = serializers.EmailField()
    code = serializers.RegexField(r"^\d{6}$")

    def validate(self, attrs):
        from .models import PasswordResetCode

        email = attrs["email"]
        code = attrs["code"]

        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No account found with this email address.")

        reset_code = (
            PasswordResetCode.objects.filter(user=user, code=code, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if reset_code is None:
            raise serializers.ValidationError("Invalid reset code.")

        if reset_code.is_expired():
            raise serializers.ValidationError("This code has expired. Please request a new one.")

        attrs["user"] = user
        attrs["reset_code"] = reset_code
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """Validates the code again and sets the new password."""

    email = serializers.EmailField()
    code = serializers.RegexField(r"^\d{6}$")
    new_password = serializers.CharField(min_length=6, write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        from .models import PasswordResetCode

        email = attrs["email"]
        code = attrs["code"]

        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No account found with this email address.")

        reset_code = (
            PasswordResetCode.objects.filter(user=user, code=code, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if reset_code is None:
            raise serializers.ValidationError("Invalid reset code.")

        if reset_code.is_expired():
            raise serializers.ValidationError("This code has expired. Please request a new one.")

        attrs["user"] = user
        attrs["reset_code"] = reset_code
        return attrs

