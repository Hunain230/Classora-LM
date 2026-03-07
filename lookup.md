# Classora LMS – Lookup File (Iteration 1)

## 1. Environment Setup (Backend)

### 1.1. Create and activate virtual environment (Windows / PowerShell)

From the project root:

```powershell
cd C:\Users\surface\Desktop\classora_lms
python -m venv venv
```

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

### 1.2. Install backend dependencies

With the venv active:

```powershell
pip install -r requirements.txt
```

This installs:

- django==6.0.3
- mysqlclient==2.2.8
- djangorestframework==3.16.1
- djangorestframework-simplejwt==5.5.1
- django-cors-headers==4.9.0

### 1.3. Apply database migrations (MySQL)

Ensure your MySQL database `classora_lms` exists and matches the credentials in `classora/settings.py`.

Then run:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 1.4. Run the backend server

From the project root with venv active:

```powershell
python manage.py runserver
```

Backend will be available at:

```text
http://127.0.0.1:8000
```

---

## 2. Environment Setup (Frontend – React + Vite)

### 2.1. Install Node dependencies

From the frontend folder:

```powershell
cd C:\Users\surface\Desktop\classora_lms\frontend
npm install
```

### 2.2. Run the frontend dev server

```powershell
npm run dev
```

Vite will show a URL such as:

```text
http://localhost:5173
```

Open `/login` to use the login UI:

```text
http://localhost:5173/login
```

The frontend is configured to talk to the backend at `http://127.0.0.1:8000`.

---

## 3. Iteration 1 / Sprint 1 – Project Report

### 3.1. Audit of Iteration 1 / Sprint 1 Features

- **Login system with JWT authentication (email/password, access + refresh tokens)**  
  - **Status**: Implemented.  
  - **Details**:
    - Backend: `POST /api/login` issues `access` + `refresh` using SimpleJWT; `POST /api/token/refresh/` implemented via `TokenRefreshView`.
    - Uses `CustomUser.USERNAME_FIELD = "email"` and `authenticate(email=..., password=...)`.

- **Institute registration workflow (admin account creation + unique institute ID)**  
  - **Status**: Implemented (backend + frontend UI).  
  - **Details**:
    - Backend: `POST /api/institute/register` creates `Institute` with unique `institute_code` and an `ADMIN` `CustomUser` linked to it.
    - Unique code generation + transactional create handled in `InstituteRegisterSerializer`.

- **Role-based dashboards (ADMIN, TEACHER, STUDENT)**  
  - **Status**: Implemented (first version).  
  - **Details**:
    - Frontend:
      - `AdminDashboard` at `/admin` with institute info, users list and create-user form.
      - `TeacherDashboard` at `/teacher` with teacher info and list of students in the same institute.
      - `StudentDashboard` at `/student` with student info and associated institute info.
      - Client-side route guards ensure each role can only access its own dashboard; cross-role navigation redirects to the correct dashboard.
    - Backend:
      - Role concept (`CustomUser.Role`) with `IsAdminRole`, `IsTeacherRole`, `IsStudentRole`.
      - Dedicated endpoints: `/api/teacher/dashboard/` and `/api/student/dashboard/`.

- **User account creation (ADMIN creating TEACHER/STUDENT)**  
  - **Status**: Implemented.  
  - **Details**:
    - Backend: `POST /api/users/create/` (JWT + `IsAdminRole` required) uses `CreateUserSerializer` and `CustomUser.objects.create_user`.
    - Enforces:
      - Email uniqueness.
      - Admin must be authenticated and have an institute.
      - `institute_id` in the request must match the admin’s own institute.
    - Frontend: `CreateUserForm` in `AdminDashboard` posts to `/api/users/create/`.

- **Admin dashboard with institute info, users list, and create-user form**  
  - **Status**: Implemented.  
  - **Details**:
    - `AdminDashboard.jsx`:
      - Loads current user via `/api/me`.
      - Renders:
        - `InstituteInfo` → `/api/institute/<institute_id>/`
        - `CreateUserForm` → `/api/users/create/`
        - `UserList` → `/api/users/?institute=<institute_id>`

- **Frontend-backend integration using Axios + React routing**  
  - **Status**: Implemented.  
  - **Details**:
    - Axios client with base URL `http://127.0.0.1:8000` and Authorization header: `src/api/client.js`.
    - Auth helpers (`loginRequest`, `fetchMe`) in `src/api/auth.js`.
    - Routing via `react-router-dom` in `src/App.jsx`.

- **Backend APIs protected with JWT and role-based permissions**  
  - **Status**: Implemented.  
  - **Details**:
    - `REST_FRAMEWORK` default auth: `JWTAuthentication`.
    - Default permission: `IsAuthenticated`, with `AllowAny` explicitly set on `/api/login` and `/api/institute/register`.
    - `IsAdminRole` permission used for institute/user management endpoints.

- **CORS and token storage handling for frontend**  
  - **Status**: Implemented.  
  - **Details**:
    - CORS: `django-cors-headers` configured with `CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]` and middleware in place.
    - Tokens stored in `localStorage` (`access_token`, `refresh_token`, `current_user`).
    - Automatic token refresh implemented on the frontend: Axios response interceptor calls `/api/token/refresh/` on 401 (for non-auth endpoints) using the stored `refresh_token`, updates `access_token`, and retries the original request once.

- **Proper database tables migrated and functioning**  
  - **Status**: Implemented.  
  - **Details**:
    - Models: `Institute`, `CustomUser` (custom auth user).
    - Migrations created and applied earlier; `manage.py check` currently clean.
    - MySQL connection configured and used as default DB.

- **Functional Postman/curl tests for all endpoints**  
  - **Status**: **Test plan prepared, actual execution is on your environment.**  
  - **Details**:
    - All endpoints have clear inputs/outputs and were validated via Django checks; however, actual Postman/curl execution must be run against your running dev server (see testing section below).

---

## 3.2. Project Documentation – Iteration 1 / Sprint 1

### Project title and overview

**Project title**: Classora – Multi-Tenant Learning Management System (LMS)  
**Goal**: Provide a multi-tenant LMS where each institute has its own users (admins, teachers, students), with isolated data, JWT-based authentication, and a React-based admin UI.

Iteration 1 / Sprint 1 focuses on:

- Core authentication and institute onboarding.
- Basic role model and admin capabilities.
- A working admin dashboard UI using the real backend.

### Tech stack used

- **Backend**
  - Python 3.12
  - Django 6.0.3
  - Django REST Framework (`djangorestframework`)
  - `djangorestframework-simplejwt` (JWT authentication)
  - `django-cors-headers` (CORS)
  - MySQL (`django.db.backends.mysql` with `mysqlclient`)

- **Frontend**
  - React 19 (Vite-based app)
  - React Router (`react-router-dom`)
  - Axios (HTTP client)
  - Vite build tooling

- **Environment**
  - Virtualenv (`venv`) at project root
  - Requirements in `requirements.txt`

### Iteration 1 / Sprint 1 tasks and implementations

1. **Authentication & JWT**
   - Login endpoint with email/password.
   - Issuance of access and refresh tokens.
   - Default JWT authentication for all DRF views.

2. **Institute Registration**
   - Endpoint to create an institute and its initial admin user.
   - Unique institute code generation.

3. **Role Model & Dashboards**
   - Roles: `ADMIN`, `TEACHER`, `STUDENT`.
   - Dashboards implemented for all three roles with role-based routing and guards.

4. **User Management**
   - Admin-only endpoints to list and create users within the same institute.

5. **Frontend Integration**
   - Login page, institute registration page, and all dashboards wired to backend APIs with Axios.
   - Routing via React Router, with role-based guards for protected routes.

6. **Security & CORS**
   - CORS configured for React dev host.
   - JWT protection and role-based permissions on backend.

7. **Testing & Dev Environment**
   - `manage.py check` clean.
   - Test flows documented via curl/Postman examples.

---

## 3.3. Backend API Structure

### Auth & Onboarding

- **POST `/api/institute/register`**  
  - **Access**: Public (`AllowAny`).  
  - **Body**:

    ```json
    {
      "institute_name": "Classora Academy",
      "admin_name": "Admin User",
      "admin_email": "admin@classora.com",
      "password": "Pass12345"
    }
    ```

  - **Behavior**:
    - Creates `Institute` with unique `institute_code`.
    - Creates `CustomUser` with:
      - `full_name = admin_name`
      - `email = admin_email`
      - `role = "ADMIN"`
      - `institute = created institute`
    - Returns both institute and admin details.
  - **Status codes**:
    - `201 Created` on success.
    - `400 Bad Request` on validation errors (missing fields, duplicate admin email).

- **POST `/api/login`**  
  - **Access**: Public (`AllowAny`).  
  - **Body**:

    ```json
    {
      "email": "admin@classora.com",
      "password": "Pass12345"
    }
    ```

  - **Behavior**:
    - Authenticates with Django’s `authenticate(email=..., password=...)`.
    - On success:
      - Creates `RefreshToken` and its corresponding `access` token.
      - Returns tokens and user info.
  - **Response (200 OK)**:

    ```json
    {
      "access": "<access_token>",
      "refresh": "<refresh_token>",
      "user": {
        "id": 1,
        "full_name": "Admin User",
        "email": "admin@classora.com",
        "role": "ADMIN",
        "institute_id": 1
      }
    }
    ```

  - **Errors**:
    - `400 Bad Request` for missing fields.
    - `401 Unauthorized` for invalid credentials / inactive user.

- **POST `/api/token/refresh/`**  
  - **Access**: Public (requires valid refresh token in body).  
  - **Body**:

    ```json
    {
      "refresh": "<refresh_token>"
    }
    ```

  - **Response (200 OK)**:

    ```json
    {
      "access": "<new_access_token>"
    }
    ```

### Authenticated User Info

- **GET `/api/me`**  
  - **Access**: Authenticated (`IsAuthenticated`).  
  - **Headers**: `Authorization: Bearer <access_token>`  
  - **Response (200 OK)**:

    ```json
    {
      "id": 1,
      "full_name": "Admin User",
      "email": "admin@classora.com",
      "role": "ADMIN",
      "institute_id": 1
    }
    ```

### Institute Management (Admin Only)

- **GET `/api/institute/<id>/`**  
  - **Access**: `IsAuthenticated` + `IsAdminRole`.  
  - **Behavior**:
    - Returns institute details only if `request.user.institute_id == id`.
    - Otherwise responds with `404 Not Found` to avoid leaking tenant IDs.
  - **Response (200 OK)**:

    ```json
    {
      "id": 1,
      "name": "Classora Academy",
      "institute_code": "ABC123XYZ",
      "created_at": "2026-03-07T00:00:00Z"
    }
    ```

### User Management (Admin Only)

- **GET `/api/users/?institute=<id>&search=<term>&page=<n>&page_size=<m>`**  
  - **Access**: `IsAuthenticated` + `IsAdminRole`.  
  - **Behavior**:
    - Requires `institute` query param.
    - Confirms the `institute` matches `request.user.institute_id`.
    - Optional `search` filters by `full_name` or `email` (case-insensitive).
    - Optional `page` and `page_size` control pagination (defaults: `page=1`, `page_size=10`, max page size 100).
  - **Response (200 OK)**:

    ```json
    {
      "results": [
        {
          "id": 1,
          "full_name": "Admin User",
          "email": "admin@classora.com",
          "role": "ADMIN",
          "institute_id": 1
        },
        {
          "id": 2,
          "full_name": "Teacher One",
          "email": "teacher1@classora.com",
          "role": "TEACHER",
          "institute_id": 1
        }
      ],
      "page": 1,
      "page_size": 10,
      "total": 2,
      "has_next": false,
      "has_previous": false
    }
    ```

- **POST `/api/users/create/`**  
  - **Access**: `IsAuthenticated` + `IsAdminRole`.  
  - **Body**:

    ```json
    {
      "full_name": "Teacher One",
      "email": "teacher1@classora.com",
      "role": "TEACHER",
      "password": "Pass12345",
      "institute_id": 1
    }
    ```

  - **Behavior**:
    - Validates:
      - Email uniqueness.
      - Institute matches admin’s own institute.
    - Creates `CustomUser` using `create_user()` with hashed password.
  - **Response (201 Created)**:

    ```json
    {
      "id": 2,
      "full_name": "Teacher One",
      "email": "teacher1@classora.com",
      "role": "TEACHER",
      "institute_id": 1
    }
    ```

### Teacher & Student Dashboards

- **GET `/api/teacher/dashboard/`**  
  - **Access**: `IsAuthenticated` + `IsTeacherRole`.  
  - **Behavior**:
    - Returns the teacher’s own user info and a list of students in the same institute.
  - **Response (200 OK)**:

    ```json
    {
      "user": {
        "id": 3,
        "full_name": "Teacher One",
        "email": "teacher1@classora.com",
        "role": "TEACHER",
        "institute_id": 1
      },
      "students": [
        {
          "id": 4,
          "full_name": "Student One",
          "email": "student1@classora.com",
          "role": "STUDENT",
          "institute_id": 1
        }
      ]
    }
    ```

- **GET `/api/student/dashboard/`**  
  - **Access**: `IsAuthenticated` + `IsStudentRole`.  
  - **Behavior**:
    - Returns the student’s own user info and their institute details (if any).
  - **Response (200 OK)**:

    ```json
    {
      "user": {
        "id": 4,
        "full_name": "Student One",
        "email": "student1@classora.com",
        "role": "STUDENT",
        "institute_id": 1
      },
      "institute": {
        "id": 1,
        "name": "Classora Academy",
        "institute_code": "ABC123XYZ",
        "created_at": "2026-03-07T00:00:00Z"
      }
    }
    ```

---

## 3.4. Frontend Structure and Routing

### Project Structure (frontend)

Key parts under `frontend/src`:

- `App.jsx` – main router.
- `main.jsx` – React bootstrap.
- `api/client.js` – configured Axios instance with JWT header.
- `api/auth.js` – login, `/api/me`, institute registration, and logout helpers.
- `pages/LoginPage.jsx` – login UI and token storage, with a link to institute registration.
- `pages/InstituteRegisterPage.jsx` – institute registration UI.
- `pages/admin/AdminDashboard.jsx` – main admin dashboard.
- `pages/admin/InstituteInfo.jsx` – institute display component.
- `pages/admin/UserList.jsx` – users table for an institute.
- `pages/admin/CreateUserForm.jsx` – user creation form.
 - `pages/TeacherDashboard.jsx` – teacher dashboard.
 - `pages/StudentDashboard.jsx` – student dashboard.

### Routing

In `App.jsx`:

- `/login` → `LoginPage`
- `/register` → `InstituteRegisterPage`
- `/admin` → `AdminDashboard` (wrapped in a role guard for `ADMIN`)
- `/teacher` → `TeacherDashboard` (wrapped in a role guard for `TEACHER`)
- `/student` → `StudentDashboard` (wrapped in a role guard for `STUDENT`)
- `*` → default to `LoginPage`

### Login Flow (Frontend)

- `LoginPage`:
  - Validates that email and password are not empty.
  - Uses `loginRequest(email, password)` to POST `/api/login`.
  - On success:
    - Stores `access_token`, `refresh_token`, `current_user` in `localStorage`.
    - Redirects to `/admin`, `/teacher`, or `/student` based on `user.role`.
  - On error:
    - `400` → shows form validation errors or generic “check the fields”.
    - `401` → “Invalid email or password.”
    - Network/CORS issues → “Cannot connect to server. Please try again.”

### Admin Dashboard Flow (Frontend)

- `AdminDashboard`:
  - On mount: calls `fetchMe()` (`GET /api/me`).
  - If success:
    - Shows welcome header with `full_name` and role, plus a logout button.
    - Renders:
      - `InstituteInfo` with `instituteId`.
      - `CreateUserForm` for new users in this institute.
      - `UserList` for all users in this institute, with search and pagination.
  - If failure:
    - Shows an error instructing login again.

- `TeacherDashboard`:
  - On mount: calls `GET /api/teacher/dashboard/`.
  - Shows teacher info and a list of students in the same institute, plus a logout button.

- `StudentDashboard`:
  - On mount: calls `GET /api/student/dashboard/`.
  - Shows student info and basic institute details, plus a logout button.

---

## 3.5. JWT & Refresh Token – How It Works

- **Backend (SimpleJWT)**
  - `login` view:
    - On successful authentication:
      - `refresh = RefreshToken.for_user(user)`
      - `access = refresh.access_token`
    - Returns both tokens plus user info.
  - `JWTAuthentication`:
    - For each request:
      - Reads `Authorization: Bearer <access_token>`.
      - Validates signature, expiration, etc.
      - On success: sets `request.user`.
      - On failure: responds with `401 Unauthorized`.
  - `TokenRefreshView`:
    - Accepts a refresh token in the body and returns a new access token.

- **Frontend**
  - Tokens stored in `localStorage` after login.
  - Axios request interceptor in `api/client.js` attaches the `Authorization` header based on `access_token`.
  - Automatic refresh flow:
    - Axios response interceptor:
      - When a request (other than login/registration/refresh) gets a `401` response, it:
        - Reads `refresh_token` from `localStorage`.
        - Calls `POST /api/token/refresh/` with `{ "refresh": "<refresh_token>" }`.
        - Stores the new `access_token`.
        - Retries the original request once with the new token.
      - If refresh fails, it clears all tokens/user data and redirects to `/login`.

---

## 3.6. Testing with Postman / curl

Assuming backend running at `http://127.0.0.1:8000`:

1. **Register an institute + admin**

   ```bash
   curl -X POST http://127.0.0.1:8000/api/institute/register \
     -H "Content-Type: application/json" \
     -d '{
       "institute_name": "Classora Academy",
       "admin_name": "Admin User",
       "admin_email": "admin@classora.com",
       "password": "Pass12345"
     }'
   ```

2. **Login to get tokens**

   ```bash
   curl -X POST http://127.0.0.1:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@classora.com", "password": "Pass12345"}'
   ```

   Save `access` and `refresh`.

3. **Call `/api/me` (protected)**

   ```bash
   curl http://127.0.0.1:8000/api/me \
     -H "Authorization: Bearer <access_token>"
   ```

4. **Get institute detail (admin-only)**

   ```bash
   curl http://127.0.0.1:8000/api/institute/1/ \
     -H "Authorization: Bearer <access_token>"
   ```

5. **List users in institute (admin-only)**

   ```bash
   curl "http://127.0.0.1:8000/api/users/?institute=1" \
     -H "Authorization: Bearer <access_token>"
   ```

6. **Create a teacher user (admin-only)**

   ```bash
   curl -X POST http://127.0.0.1:8000/api/users/create/ \
     -H "Authorization: Bearer <access_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Teacher One",
       "email": "teacher1@classora.com",
       "role": "TEACHER",
       "password": "Pass12345",
       "institute_id": 1
     }'
   ```

7. **Refresh access token**

   ```bash
   curl -X POST http://127.0.0.1:8000/api/token/refresh/ \
     -H "Content-Type: application/json" \
     -d '{"refresh": "<refresh_token>"}'
   ```

---

## 3.7. UI Screenshot Placeholders (for report)

- **Login Page**  
  _Screenshot 1: `LoginPage` with email/password fields and “Login” button._

- **Admin Dashboard – Overview**  
  _Screenshot 2: `AdminDashboard` showing welcome header, institute info, create-user form, and users table._

- **Admin Dashboard – Institute Info**  
  _Screenshot 3: `InstituteInfo` block with name, code, and created date._

- **Admin Dashboard – User Creation**  
  _Screenshot 4: `CreateUserForm` with fields for full name, email, password, and role selector._

---

## 3.8. Non-Functional Requirements (Current & Planned)

- **Security**
  - JWT-based authentication for all protected APIs.
  - Role-based permission for institute/user management (`IsAdminRole`).
  - CORS restricted to known frontend origins during development.
  - Passwords never stored in plain text (using Django’s password hashing).

- **Performance**
  - Lightweight, stateless JWT authentication (no server-side sessions needed).
  - Simple, fast queries filtered by `institute_id`.
  - **Future**: Add pagination for `/api/users/` and more complex lists.

- **Scalability**
  - Multi-tenant separation via `institute_id` foreign key.
  - HTTP/JSON APIs compatible with multiple frontends (web, mobile).
  - Ready to scale horizontally by sharing DB and using stateless JWT.

- **Usability**
  - Clean login page with validation and clear error messages.
  - Simple admin dashboard with all key actions (view institute, list users, create users) on one screen.
  - Role-based navigation scaffolding for future TEACHER/STUDENT dashboards.

---

## 3.9. Work Division Among Team Members (Suggested)

*(Assumed 3-person team for documentation purposes; adjust names/roles as needed.)*

- **Backend Engineer**
  - Designed data models (`Institute`, `CustomUser`).
  - Implemented API endpoints for registration, login, JWT, institute detail, user listing/creation.
  - Configured DRF, SimpleJWT, MySQL, and CORS.

- **Frontend Engineer**
  - Implemented React Vite app, routing, and Axios client.
  - Built `LoginPage` and `AdminDashboard` (with `InstituteInfo`, `UserList`, `CreateUserForm`).
  - Integrated token storage and error handling.

- **QA / DevOps / Integration**
  - Prepared curl/Postman test collections for all endpoints.
  - Verified migrations and environment setup (venv, requirements).
  - Validated cross-origin behavior between frontend and backend.

---

## 3.10. Missing / Partial Implementations and Next Steps

- **Institute registration UI (frontend)**  
  - Currently, registration is backend-only.  
  - **Next**: Add a React page for institute sign-up that calls `/api/institute/register` and then redirects to `/login`.

- **Teacher & Student dashboards**  
  - Presently just placeholders.  
  - **Next**:
    - Implement teacher/student-specific endpoints (e.g., course lists, assigned classes).
    - Build real dashboards for `/teacher` and `/student`.
    - Add client-side route guards (redirect users to proper dashboard if they manually type another role’s URL).

- **Automatic token refresh on frontend**
  - Currently, frontend doesn’t auto-refresh access tokens.  
  - **Next**:
    - Implement an Axios response interceptor that, on `401` due to expired token, calls `/api/token/refresh/` with `refresh_token` and retries the original request.

- **Additional hardening & UX**
  - Add logout (clear tokens and navigate to `/login`).
  - Handle forbidden/unauthorized states (e.g., 403 from admin-only endpoints) with user-friendly messages.
  - Introduce pagination and search on user list.

