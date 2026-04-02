# Migration Blueprint: Supabase to Django + PostgreSQL

This document outlines the strategy and technical requirements for migrating **PolyGen** from a Supabase-centric architecture to a custom **Django** backend with a **PostgreSQL** database.

## 1. Migration Strategy Overview

The migration involves moving the backend logic, authentication, and data storage from Supabase's managed services to a self-hosted or managed Django application.

### Key Transitions
| Feature | Current (Supabase) | New (Django + PostgreSQL) |
| :--- | :--- | :--- |
| **Language** | SQL / Client-side JS | Python 3.11+ |
| **Framework** | Supabase JS SDK | Django 4.2+ / Django REST Framework |
| **Database** | Managed PostgreSQL | PostgreSQL 15+ |
| **Auth** | Supabase Auth (GoTrue) | Django Authentication / Social Auth |
| **API** | PostgREST (Auto-generated) | RESTful API (DRF) |

---

## 2. PostgreSQL Schema (Raw SQL)

While Django handles schema creation via Migrations, this is the underlying PostgreSQL structure:

```sql
-- PolyGen PostgreSQL Schema

-- Institutional Hierarchy
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Extending Django Auth User)
CREATE TABLE profiles (
    user_id INTEGER PRIMARY KEY REFERENCES auth_user(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    position VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Bank
CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES auth_user(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    clo VARCHAR(100),
    bloom_level VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Papers
CREATE TABLE assessment_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES auth_user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_marks INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Django Implementation Plan

### Step 1: Environment Setup
1. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers psycopg2-binary social-auth-app-django
   ```
2. Initialize project:
   ```bash
   django-admin startproject polygen_backend
   python manage.py startapp core
   ```

### Step 2: Define Django Models (`core/models.py`)
Translate the schema into Django's ORM:
```python
from django.db import models
from django.contrib.auth.models import User
import uuid

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.JSONField()
    difficulty = models.CharField(max_length=20, choices=[('EASY', 'Easy'), ('MEDIUM', 'Medium'), ('HARD', 'Hard')])
    # ... other fields
```

### Step 3: Authentication Migration
- Replace Supabase Auth with `social-auth-app-django` for Google SSO.
- Configure `AUTHENTICATION_BACKENDS` in `settings.py` to include Google OAuth2.

### Step 4: API Development (DRF)
- Create Serializers for all models.
- Implement ViewSets for CRUD operations.
- Add custom logic for AI generation (calling Gemini API from the Python backend).

### Step 5: Frontend Refactoring
- Replace `supabase-js` calls with standard `fetch` or `axios` calls to the new Django API endpoints.
- Update the `AuthContext` to handle Django's session or JWT-based authentication.

## 4. Migration Risks & Mitigations
- **Data Integrity:** Use Django's `inspectdb` if the database already exists to generate initial models.
- **Auth Tokens:** Supabase JWTs are not compatible with Django sessions; users will need to re-authenticate during the transition.
- **RLS to Django Permissions:** Supabase RLS policies must be manually re-implemented as Django `Permissions` or QuerySet filters.
