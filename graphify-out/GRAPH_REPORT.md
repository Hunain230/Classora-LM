# Graph Report - C:\Users\surface\Desktop\classora-lms\classora-lms  (2026-04-21)

## Corpus Check
- 68 files · ~37,133 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 913 edges · 62 communities detected
- Extraction: 24% EXTRACTED · 76% INFERRED · 0% AMBIGUOUS · INFERRED: 698 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]

## God Nodes (most connected - your core abstractions)
1. `CustomUser` - 56 edges
2. `Course` - 37 edges
3. `CourseSerializer` - 36 edges
4. `Institute` - 33 edges
5. `Notification` - 33 edges
6. `QuizViewSet` - 33 edges
7. `AnnouncementViewSet` - 32 edges
8. `AnnouncementCommentViewSet` - 32 edges
9. `Department` - 31 edges
10. `Quiz` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Meta` --uses--> `Institute`  [INFERRED]
  C:\Users\surface\Desktop\classora-lms\classora-lms\lms\serializers.py → C:\Users\surface\Desktop\classora-lms\classora-lms\accounts\models.py
- `Department` --uses--> `Institute`  [INFERRED]
  C:\Users\surface\Desktop\classora-lms\classora-lms\lms\models.py → C:\Users\surface\Desktop\classora-lms\classora-lms\accounts\models.py
- `Course` --uses--> `Institute`  [INFERRED]
  C:\Users\surface\Desktop\classora-lms\classora-lms\lms\models.py → C:\Users\surface\Desktop\classora-lms\classora-lms\accounts\models.py
- `Lecture` --uses--> `Institute`  [INFERRED]
  C:\Users\surface\Desktop\classora-lms\classora-lms\lms\models.py → C:\Users\surface\Desktop\classora-lms\classora-lms\accounts\models.py
- `Assignment` --uses--> `Institute`  [INFERRED]
  C:\Users\surface\Desktop\classora-lms\classora-lms\lms\models.py → C:\Users\surface\Desktop\classora-lms\classora-lms\accounts\models.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (39): Announcement, AnnouncementComment, Assignment, AssignmentSubmission, AttendanceEntry, AttendanceRecord, Course, Department (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (41): AbstractBaseUser, CustomUserAdmin, InstituteAdmin, BasePermission, BaseUserAdmin, CustomUser, Institute, Meta (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (2): grade(), mark_all_read()

### Community 3 - "Community 3"
Cohesion: 0.24
Nodes (1): QuizViewSet

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (3): AppConfig, AccountsConfig, LmsConfig

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (2): BaseUserManager, CustomUserManager

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (2): main(), Run administrative tasks.

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (1): Migration

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (1): Migration

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (1): ASGI config for classora project.  It exposes the ASGI callable as a module-leve

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (1): Django settings for classora project.  Generated by 'django-admin startproject'

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): URL configuration for classora project.  The `urlpatterns` list routes URLs to v

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): WSGI config for classora project.  It exposes the WSGI callable as a module-leve

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Migration

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Migration

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Migration

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Migration

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Migration

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Migration

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **13 isolated node(s):** `Run administrative tasks.`, `Role`, `Migration`, `ASGI config for classora project.  It exposes the ASGI callable as a module-leve`, `Django settings for classora project.  Generated by 'django-admin startproject'` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (2 nodes): `Migration`, `0002_institute_academic_year_institute_address_and_more.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `ASGI config for classora project.  It exposes the ASGI callable as a module-leve`, `asgi.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `settings.py`, `Django settings for classora project.  Generated by 'django-admin startproject'`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `urls.py`, `URL configuration for classora project.  The `urlpatterns` list routes URLs to v`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `wsgi.py`, `WSGI config for classora project.  It exposes the WSGI callable as a module-leve`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `DashboardLayout.jsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `Logo.jsx`, `Logo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `AnalyticsPage()`, `AnalyticsPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `AnnouncementsPage()`, `AnnouncementsPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `InstituteRegisterPage.jsx`, `InstituteRegisterPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `LandingPage.jsx`, `LandingPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `LoginPage.jsx`, `LoginPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `StudentDashboard.jsx`, `StudentDashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `StudentQuizzesPage.jsx`, `StudentQuizzesPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `TeacherAttendancePage.jsx`, `TeacherAttendancePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `TeacherDashboard.jsx`, `TeacherDashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `TeacherLecturePage.jsx`, `TeacherLecturePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `TeacherQuizzesPage.jsx`, `TeacherQuizzesPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `AdminDashboard()`, `AdminDashboard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `CreateCoursePage.jsx`, `CreateCoursePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `CreateUserForm.jsx`, `CreateUserForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `DepartmentsPage.jsx`, `DepartmentsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `EnrollStudentPage.jsx`, `EnrollStudentPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `InstituteInfo.jsx`, `InstituteInfo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `UserList.jsx`, `UserList()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `.is_active()`, `.get_is_active()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `Migration`, `0002_department_alter_course_department.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `Migration`, `0003_notification_assignmentsubmission.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `Migration`, `0004_assignment_links_assignmentsubmission_links.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `Migration`, `0005_quiz_end_time_quiz_start_time_quizattempt.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `Migration`, `0006_announcement_department_announcement_target_role_and_more.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `Migration`, `0007_announcement_image.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `check_teacher_visibility.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `debug_course_creation.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `debug_get_400.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `fix_assignment.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `test_db_conn.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `tests.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `client.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `admin.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `tests.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomUser` connect `Community 1` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Institute` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `QuizViewSet` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 52 inferred relationships involving `CustomUser` (e.g. with `InstituteAdmin` and `CustomUserAdmin`) actually correct?**
  _`CustomUser` has 52 INFERRED edges - model-reasoned connections that need verification._
- **Are the 35 inferred relationships involving `Course` (e.g. with `Return details of the admin's own institute.` and `List all users that belong to the admin's institute.`) actually correct?**
  _`Course` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 35 inferred relationships involving `CourseSerializer` (e.g. with `Return details of the admin's own institute.` and `List all users that belong to the admin's institute.`) actually correct?**
  _`CourseSerializer` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `Institute` (e.g. with `InstituteAdmin` and `CustomUserAdmin`) actually correct?**
  _`Institute` has 31 INFERRED edges - model-reasoned connections that need verification._