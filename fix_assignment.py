import os
import django
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classora.settings')
django.setup()

from accounts.models import CustomUser
from lms.models import Course, Department

try:
    with transaction.atomic():
        ali = CustomUser.objects.get(email='ali@gmail.com')
        admin = CustomUser.objects.filter(role='ADMIN').first()
        cs = Department.objects.get(id=4)
        
        course, created = Course.objects.get_or_create(
            code='PY401',
            defaults={
                'name': 'Advanced Python',
                'department': cs,
                'institute': admin.institute,
                'is_published': True,
                'duration_weeks': 16,
                'max_students': 40,
                'credits': 3
            }
        )
        course.teachers.add(ali)
        course.save()
        
        print(f"Course: {course.name} ({course.code})")
        print(f"Teachers for this course: {[t.email for t in course.teachers.all()]}")
        
        # Double check Ali's side
        ali_courses = Course.objects.filter(teachers=ali)
        print(f"Ali's courses count: {ali_courses.count()}")
        for c in ali_courses:
            print(f" - {c.name}")

except Exception as e:
    print(f"ERROR: {e}")
