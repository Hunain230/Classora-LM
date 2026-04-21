from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone


class Institute(models.Model):
    name = models.CharField(max_length=255)
    institute_code = models.CharField(max_length=50, unique=True)
    
    # New Branding & Description Fields
    logo = models.ImageField(upload_to="institute_logos/", null=True, blank=True)
    primary_color = models.CharField(max_length=20, default="#2196F3")
    description = models.TextField(null=True, blank=True)
    
    # Contact Info
    website = models.URLField(max_length=255, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    # Schedule
    academic_year = models.CharField(max_length=20, null=True, blank=True)
    semester = models.CharField(max_length=20, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.institute_code})"


class CustomUserManager(BaseUserManager):
    def _create_user(self, email, full_name, password, **extra_fields):
        if not email:
            raise ValueError("The email field must be set")
        if not full_name:
            raise ValueError("The full_name field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        if extra_fields.get("is_superuser"):
            raise ValueError("Regular users cannot have is_superuser=True")
        return self._create_user(email, full_name, password, **extra_fields)

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", CustomUser.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, full_name, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        TEACHER = "TEACHER", "Teacher"
        STUDENT = "STUDENT", "Student"

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )
    institute = models.ForeignKey(
        Institute,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self) -> str:
        return self.email


class PasswordResetCode(models.Model):
    """
    Stores a 6-digit OTP code for password reset.
    Codes expire after 10 minutes and are single-use.
    """

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="reset_codes",
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def __str__(self) -> str:
        return f"ResetCode({self.user.email}, {self.code}, used={self.is_used})"
