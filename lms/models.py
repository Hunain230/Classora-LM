from django.db import models
from django.utils import timezone
from accounts.models import Institute, CustomUser

class Department(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.institute.name})"

class Course(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name="courses")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    semester = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    icon = models.ImageField(upload_to="course_icons/", null=True, blank=True)
    credits = models.PositiveIntegerField(default=3)
    duration_weeks = models.PositiveIntegerField(default=16)
    max_students = models.PositiveIntegerField(default=50)
    is_published = models.BooleanField(default=False)
    teachers = models.ManyToManyField(CustomUser, related_name="courses_taught", limit_choices_to={'role': 'TEACHER'})
    students = models.ManyToManyField(CustomUser, related_name="enrolled_courses", limit_choices_to={'role': 'STUDENT'}, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code}: {self.name}"

class Lecture(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lectures")
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    materials = models.FileField(upload_to="lecture_materials/", null=True, blank=True)
    external_links = models.JSONField(default=list, blank=True) # List of dicts: {"label": "", "url": ""}
    scheduled_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    description = models.TextField()
    attachment = models.FileField(upload_to="assignments/", null=True, blank=True)
    links = models.JSONField(default=list, blank=True)  # [{"label": "Resource", "url": "https://..."}]
    due_date = models.DateTimeField()
    total_marks = models.PositiveIntegerField(default=100)
    allow_late_submission = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    instructions = models.TextField(null=True, blank=True)
    total_time_minutes = models.PositiveIntegerField(default=30)
    show_answers_after = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    class Type(models.TextChoices):
        MCQ = "MCQ", "Multiple Choice"
        SHORT_ANSWER = "SHORT_ANSWER", "Short Answer"
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_type = models.CharField(max_length=20, choices=Type.choices, default=Type.MCQ)
    text = models.TextField()
    options = models.JSONField(default=list, blank=True) # List of strings for MCQ
    correct_answer = models.TextField() # Index for MCQ or text for short answer
    points = models.PositiveIntegerField(default=1)

class AttendanceRecord(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

class AttendanceEntry(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LATE = "LATE", "Late"
    
    record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name="entries")
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    remarks = models.TextField(null=True, blank=True)

class Announcement(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name="announcements")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="announcements", null=True, blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class AssignmentSubmission(models.Model):
    class Status(models.TextChoices):
        ON_TIME = "ON_TIME", "On Time"
        LATE = "LATE", "Late"
        GRADED = "GRADED", "Graded"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    submitted_at = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to="assignment_submissions/", null=True, blank=True)
    links = models.JSONField(default=list, blank=True)  # [{"label": "My Doc", "url": "https://..."}]
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ON_TIME)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('assignment', 'student')

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
