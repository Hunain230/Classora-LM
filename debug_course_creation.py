import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classora.settings')
django.setup()

from lms.models import Course, Department
from lms.serializers import CourseSerializer
from accounts.models import CustomUser, Institute

admin = CustomUser.objects.filter(role='ADMIN').first()
dept = Department.objects.filter(institute=admin.institute).first()
teacher = CustomUser.objects.filter(role='TEACHER', institute=admin.institute).first()

data = {
    "name": "Test Course",
    "code": "TEST101",
    "department": dept.id if dept else None,
    "semester": "Fall 2024",
    "description": "Test info",
    "credits": 3,
    "duration_weeks": 16,
    "max_students": 50,
    "is_published": True,
    "teachers": [teacher.id] if teacher else []
}

print(f"Testing with Admin: {admin.email}")
print(f"Payload: {json.dumps(data, indent=2)}")

serializer = CourseSerializer(data=data)
if serializer.is_valid():
    print("Serializer is valid!")
    # course = serializer.save(institute=admin.institute)
    # print(f"Saved course: {course}")
else:
    print(f"Serializer errors: {serializer.errors}")

# Also check what's actually in DB departments
print("\nAvailable Departments:")
for d in Department.objects.filter(institute=admin.institute):
    print(f" - ID: {d.id}, Name: {d.name}")

# Check teachers
print("\nAvailable Teachers:")
for t in CustomUser.objects.filter(role='TEACHER', institute=admin.institute):
    print(f" - ID: {t.id}, Name: {t.full_name}, Email: {t.email}")
