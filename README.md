# Classora LMS – Setup Guide

Multi-tenant Learning Management System built with **Django 6**, **Django REST Framework**, **SimpleJWT**, **React (Vite)**, and **MySQL**.

This guide explains how to run the project after cloning the repo.

---

## 1. Backend Setup (Django 6 + MySQL)

> All commands below assume **Windows PowerShell** and that you cloned the repo to  
> `C:\Users\surface\Desktop\classora_lms` (adjust paths if different).

### 1.1. Create and activate virtual environment

```powershell
cd C:\Users\surface\Desktop\classora_lms
python -m venv venv
```

Activate (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

If you see an execution policy error, run **once**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

### 1.2. Install Python dependencies

```powershell
pip install -r requirements.txt
```

This installs:

- Django 6
- Django REST Framework
- SimpleJWT
- django-cors-headers
- mysqlclient

### 1.3. Configure database (MySQL)

By default, the project is configured in `classora/settings.py` to use a MySQL database:

- **NAME**: `classora_lms`  
- **HOST**: `localhost`  
- **PORT**: `3306`

Make sure this database exists and that the credentials match your local MySQL setup.  
If needed, update the `DATABASES` setting accordingly.

### 1.4. Apply migrations

With the virtualenv active:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 1.5. Run the backend server

```powershell
python manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## 2. Frontend Setup (React + Vite)

The frontend lives in the `frontend` folder and uses Vite.

### 2.1. Install Node dependencies

```powershell
cd C:\Users\surface\Desktop\classora_lms\frontend
npm install
```

### 2.2. Run the dev server

```powershell
npm run dev
```

Vite will show a URL similar to:

```text
http://localhost:5173
```

Open:

- Login: `http://localhost:5173/login`  
- Institute registration: `http://localhost:5173/register`

The frontend is already configured to call the backend at `http://127.0.0.1:8000`.

---

## 3. Environment Variables / Configuration

Currently there is **no `.env` file required**. Key settings:

- Database configuration is in `classora/settings.py` (`DATABASES` dict).
- CORS is enabled for the React dev origins via `django-cors-headers`:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

If you change ports or database credentials, update `classora/settings.py` accordingly.

---

## 4. Authentication & JWT – How to Log In and Test

### 4.1. Register an institute + admin (one-time per tenant)

You can do this either via the **frontend** or **API**.

#### Option A – Frontend (recommended)

1. Open `http://localhost:5173/register`.
2. Fill in:
   - Institute name
   - Admin full name
   - Admin email
   - Admin password
3. Submit the form.
4. After success, click **“Go to login”** and sign in with the admin email/password you just created.

#### Option B – API (curl example)

```powershell
curl -X POST http://127.0.0.1:8000/api/institute/register \
  -H "Content-Type: application/json" \
  -d '{
    "institute_name": "Classora Academy",
    "admin_name": "Admin User",
    "admin_email": "admin@classora.com",
    "password": "Pass12345"
  }'
```

### 4.2. Login (get access + refresh tokens)

#### Frontend

1. Open `http://localhost:5173/login`.
2. Enter the admin email and password.
3. On success:
   - `access_token` and `refresh_token` are stored in `localStorage`.
   - `current_user` (id, full_name, email, role, institute_id) is stored in `localStorage`.
   - You are redirected based on `role`:
     - `ADMIN` → `/admin`
     - `TEACHER` → `/teacher`
     - `STUDENT` → `/student`

#### API (curl example)

```powershell
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@classora.com", "password": "Pass12345"}'
```

Response (simplified):

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

### 4.3. Test JWT-protected endpoints

Example using curl and the `access` token from login:

- **Current user**:

```powershell
curl http://127.0.0.1:8000/api/me \
  -H "Authorization: Bearer <access_token>"
```

- **Admin – list users in institute**:

```powershell
curl "http://127.0.0.1:8000/api/users/?institute=1" \
  -H "Authorization: Bearer <access_token>"
```

- **Admin – create user (teacher/student)**:

```powershell
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

---

## 5. Token Refresh & Route Guards (Frontend)

### 5.1. Automatic token refresh

The Axios client (`frontend/src/api/client.js`) is set up with:

- A **request interceptor** that attaches `Authorization: Bearer <access_token>` to all non-auth endpoints.
- A **response interceptor** that:
  - On `401 Unauthorized` (for non-auth endpoints), calls:
    - `POST /api/token/refresh/` with the stored `refresh_token`.
  - If refresh succeeds:
    - Stores the new `access_token`.
    - Retries the original request once with the new token.
  - If refresh fails:
    - Clears tokens and user info from `localStorage`.
    - Redirects to `/login`.

You normally don’t have to handle refresh manually in the UI – it’s automatic.

### 5.2. Route guards by role

In `App.jsx`, protected routes are wrapped with a `RequireRole` component that:

- Reads `current_user` from `localStorage`.
- If no user: redirects to `/login`.
- If role doesn’t match the route:
  - Redirects to the correct dashboard for that role (`/admin`, `/teacher`, or `/student`).

This prevents, for example, a student from manually visiting `/admin`.

### 5.3. Logout

All dashboards include a **Logout** button that:

- Calls `logout()` from `api/auth.js` to clear tokens/user data.
- Navigates back to `/login`.

---

## 6. Quick Reference – Common Windows PowerShell Commands

From the **project root**:

```powershell
# 1) Backend
cd C:\Users\surface\Desktop\classora_lms
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

In a **second terminal** for the frontend:

```powershell
cd C:\Users\surface\Desktop\classora_lms\frontend
npm install
npm run dev
```

Then:

- Register institute: `http://localhost:5173/register`
- Login: `http://localhost:5173/login`
- Admin dashboard: `http://localhost:5173/admin`

You’re ready to collaborate on Classora LMS. 🚀
*** End Patch***} -->
