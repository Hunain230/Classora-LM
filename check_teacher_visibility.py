import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classora.settings')
django.setup()

from accounts.models import CustomUser
from lms.models import Course, Department

ali = CustomUser.objects.filter(full_name__icontains='ali').first()
if not ali:
    ali = CustomUser.objects.filter(username__icontains='ali').first()

if ali:
    print(f"User: {ali.email}, Role: {ali.role}, Institute: {ali.institute}")
    
    students = CustomUser.objects.filter(role='STUDENT', institute=ali.institute)
    print(f"Students in {ali.institute}: {students.count()}")
    for s in students:
        print(f" - {s.email}: {s.full_name}")
        
    courses = Course.objects.filter(teachers=ali)
    print(f"Courses assigned to Ali: {courses.count()}")
    for c in courses:
        print(f" - {c.code}: {c.name} (Published: {c.is_published})")

    all_courses = Course.objects.all()
    print(f"Total courses in system: {all_courses.count()}")
    for c in all_courses:
        teachers = ", ".join([t.email for t in c.teachers.all()])
        inst = c.department.institute if (c.department and c.department.institute) else "N/A"
        print(f" - {c.code}: {c.name} | Teachers: {teachers} | Institute: {inst}")
else:
    print("User 'ali' not found.")
