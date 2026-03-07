from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, Institute
from .permissions import IsAdminRole, IsStudentRole, IsTeacherRole
from .serializers import (
    CreateUserSerializer,
    InstituteRegisterSerializer,
    InstituteSerializer,
    LoginSerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])  # Public: used to bootstrap a new tenant + admin.
def institute_register(request):
    serializer = InstituteRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = serializer.save()
    institute = result["institute"]
    admin_user = result["admin_user"]

    return Response(
        {
            "message": "Institute registered successfully.",
            "institute": {
                "id": institute.id,
                "name": institute.name,
                "institute_code": institute.institute_code,
                "created_at": institute.created_at,
            },
            "admin": {
                "id": admin_user.id,
                "full_name": admin_user.full_name,
                "email": admin_user.email,
                "role": admin_user.role,
                "institute_id": institute.id,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])  # Public: returns JWTs for valid email/password.
def login(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        # Missing fields or invalid credentials.
        message = serializer.errors
        # For credential issues we standardize to 401.
        if isinstance(message, dict) and "non_field_errors" in message:
            return Response({"detail": message["non_field_errors"][0]}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data["user"]
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "institute_id": user.institute_id,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])  # Example protected endpoint using JWT auth.
def me(request):
    user = request.user
    return Response(
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "institute_id": user.institute_id,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def institute_detail(request, pk: int):
    """
    Return details of the admin's own institute.
    """
    institute = get_object_or_404(Institute, pk=pk)

    # Enforce tenant boundary: admin can only view their own institute.
    if request.user.institute_id != institute.id:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = InstituteSerializer(institute)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def users_list(request):
    """
    List all users that belong to the admin's institute.
    """
    institute_id = request.query_params.get("institute")
    if not institute_id:
        return Response(
            {"detail": "The 'institute' query parameter is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if str(request.user.institute_id) != str(institute_id):
        return Response(
            {"detail": "You can only view users in your own institute."},
            status=status.HTTP_403_FORBIDDEN,
        )

    search = request.query_params.get("search", "").strip()
    try:
        page = int(request.query_params.get("page", "1"))
    except ValueError:
        page = 1
    try:
        page_size = int(request.query_params.get("page_size", "10"))
    except ValueError:
        page_size = 10

    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)

    users_qs = CustomUser.objects.filter(institute_id=institute_id)
    if search:
        users_qs = users_qs.filter(
            Q(full_name__icontains=search) | Q(email__icontains=search)
        )

    total = users_qs.count()
    start = (page - 1) * page_size
    end = start + page_size

    users = users_qs.order_by("full_name")[start:end]
    serializer = UserSerializer(users, many=True)

    return Response(
        {
            "results": serializer.data,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
            "has_previous": start > 0,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminRole])
def create_user(request):
    """
    Create a new user in the admin's institute.
    """
    serializer = CreateUserSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    output = UserSerializer(user)
    return Response(output.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacherRole])
def teacher_dashboard(request):
    """
    Basic teacher dashboard data for the current teacher.
    """
    user = request.user

    students = CustomUser.objects.filter(
        institute_id=user.institute_id, role=CustomUser.Role.STUDENT
    ).order_by("full_name")

    students_serialized = UserSerializer(students, many=True)

    return Response(
        {
            "user": UserSerializer(user).data,
            "students": students_serialized.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudentRole])
def student_dashboard(request):
    """
    Basic student dashboard data for the current student.
    """
    user = request.user
    institute = user.institute

    institute_data = None
    if institute is not None:
        institute_data = InstituteSerializer(institute).data

    return Response(
        {
            "user": UserSerializer(user).data,
            "institute": institute_data,
        },
        status=status.HTTP_200_OK,
    )
