from rest_framework import serializers
from .models import (
    Course, Lecture, Assignment, Quiz, Question, 
    AttendanceRecord, AttendanceEntry, Announcement, Department
)
from accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    courses_count = serializers.IntegerField(source='courses.count', read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'institute', 'courses_count', 'created_at']
        read_only_fields = ['institute']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ['institute']

class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = "__all__"

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = "__all__"

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"

class AttendanceEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.full_name")
    class Meta:
        model = AttendanceEntry
        fields = "__all__"

class AttendanceRecordSerializer(serializers.ModelSerializer):
    entries = AttendanceEntrySerializer(many=True, read_only=True)
    class Meta:
        model = AttendanceRecord
        fields = "__all__"

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source="author.full_name")
    class Meta:
        model = Announcement
        fields = "__all__"
