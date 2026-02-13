
# Deployment Guide

This application consists of a **Django REST Framework** backend (using PostgreSQL) and a **React (Vite)** frontend.

## 1. Backend Setup (Django + PostgreSQL)

The backend manages the database and API endpoints.

### Prerequisites
*   Python 3.8+
*   pip
*   **PostgreSQL** installed and running
*   A created database (e.g., `polygen_db`)

### Installation
1.  Navigate to the root directory.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Configuration
Set the following environment variables (or rely on defaults for localhost):
*   `DB_NAME` (Default: `polygen_db`)
*   `DB_USER` (Default: `postgres`)
*   `DB_PASSWORD` (Default: `postgres`)
*   `DB_HOST` (Default: `localhost`)
*   `DB_PORT` (Default: `5432`)

### Database Setup
1.  Make sure your Postgres server is running and the database exists.
2.  Apply migrations:
    ```bash
    python manage.py migrate
    ```

### Running Locally
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000/api`.

### Production Deployment
1.  **Environment Variables**:
    In `backend/settings.py` (or via env vars), ensure you configure:
    *   `SECRET_KEY`: Use a strong, unique string.
    *   `DEBUG`: Set to `False`.
    *   `ALLOWED_HOSTS`: Add your domain name or IP address.
    *   Database credentials.

2.  **WSGI Server**:
    Use `gunicorn` to run the server in production.
    ```bash
    gunicorn backend.wsgi:application --bind 0.0.0.0:8000
    ```

3.  **Static Files**:
    If Django is serving static files, run:
    ```bash
    python manage.py collectstatic
    ```

---

## 2. Frontend Setup (React + Vite)

The frontend is a React application built with Vite and TailwindCSS.

### Prerequisites
*   Node.js 18+
*   npm

### Installation
1.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally
```bash
npm run dev
```
Access the app at `http://localhost:5173`.
*Note: The local Vite server is configured to proxy `/api` requests to `http://localhost:8000`.*

### Production Build
1.  **Build the application**:
    ```bash
    npm run build
    ```
    This creates a `dist/` directory containing the optimized static files.

2.  **Environment Variables**:
    You can create a `.env` file to configure the API URL if not hosting on the same origin:
    ```env
    VITE_API_URL=https://your-api-domain.com/api
    ```

### Serving Frontend
Serve the contents of the `dist/` folder using a web server like Nginx, Apache, or a static site host (Vercel, Netlify).

---

## 3. Full System Architecture

### Local Development
*   **Frontend**: `localhost:5173` (Proxies API calls to port 8000)
*   **Backend**: `localhost:8000` (Postgres on 5432)

### Production Example (Nginx)
Configure Nginx to serve the `dist` folder for the root `/` path and proxy `/api` requests to the Gunicorn server running on port 8000.

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
