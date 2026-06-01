# 📋 Inventory & Order Management System

A production-ready full-stack Inventory & Order Management System built with **React**, **FastAPI**, and **PostgreSQL**, fully containerized with Docker.

---

## 🏗️ Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Frontend     | React 18, React Router v6     |
| Backend      | Python 3.12, FastAPI          |
| Database     | PostgreSQL 16                 |
| ORM          | SQLAlchemy 2.0                |
| Container    | Docker + Docker Compose       |
| Frontend CDN | nginx (Alpine)                |

---

## 📂 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic v2 schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css        # Design system
│   │   ├── components/      # Sidebar, Topbar, UI
│   │   ├── pages/           # Dashboard, Products, Customers, Orders
│   │   └── services/api.jsx  # Axios API layer
│   ├── nginx.conf
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── schema.sql               # Reference PostgreSQL schema
└── README.md
```

---

## 🚀 Quick Start (Docker)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Inventory and Order Management System"
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env if you need custom credentials
```

### 3. Start everything with one command

```bash
docker-compose up --build
```

The system will automatically:
- Start PostgreSQL and initialize the database
- Start the FastAPI backend and connect to the database
- Build and serve the React frontend via nginx

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

---

## 📡 API Reference

### Products

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/products`         | Create a product     |
| GET    | `/products`         | List all products    |
| GET    | `/products/{id}`    | Get product by ID    |
| PUT    | `/products/{id}`    | Update a product     |
| DELETE | `/products/{id}`    | Delete a product     |

### Customers

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/customers`        | Create a customer    |
| GET    | `/customers`        | List all customers   |
| GET    | `/customers/{id}`   | Get customer by ID   |
| DELETE | `/customers/{id}`   | Delete a customer    |

### Orders

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/orders`          | Create an order      |
| GET    | `/orders`          | List all orders      |
| GET    | `/orders/{id}`     | Get order by ID      |
| DELETE | `/orders/{id}`     | Delete an order      |

### Other

| Method | Endpoint      | Description             |
|--------|---------------|-------------------------|
| GET    | `/dashboard`  | Dashboard stats         |
| GET    | `/health`     | Health check            |
| GET    | `/docs`       | Swagger UI (auto-gen)   |

---

## ⚙️ Business Logic

- **SKU must be unique** — 409 Conflict returned otherwise
- **Email must be unique** — 409 Conflict returned otherwise
- **Quantity cannot be negative** — validated at schema level
- **Orders fail if inventory insufficient** — 400 Bad Request with details
- **Creating an order automatically reduces stock**
- **Deleting an order automatically restores stock**
- **total_amount is auto-calculated** = price × quantity

---

## 🐳 Docker Hub Push Steps

```bash
# 1. Login to Docker Hub
docker login

# 2. Build images with tags
docker build -t <your-dockerhub-username>/inventory-backend:latest ./backend
docker build -t <your-dockerhub-username>/inventory-frontend:latest ./frontend

# 3. Push images
docker push <your-dockerhub-username>/inventory-backend:latest
docker push <your-dockerhub-username>/inventory-frontend:latest
```

---

## ☁️ Deployment Guide

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **PostgreSQL** service from the Railway marketplace
3. Add a new service → "Deploy from GitHub repo" → select the repo
4. Set **Root Directory** to `backend`
5. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL=<Railway provided PostgreSQL URL>
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   PORT=8000
   ```
6. Railway auto-detects the Dockerfile and deploys
7. Note your Railway backend URL (e.g., `https://inventory-backend.up.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set **Root Directory** to `frontend`
3. Set the **Build Command** to: `npm run build`
4. Set the **Output Directory** to: `build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://<your-railway-backend-url>
   ```
6. Deploy — Vercel provides a live URL automatically

---

## 🔧 Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set env vars
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set env vars
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local

npm start
```

---

## 📜 PostgreSQL Schema

See [`schema.sql`](./schema.sql) for the reference DDL.

Tables auto-created by SQLAlchemy on startup — no manual migration required.

---

## Features

- [x] Products CRUD with unique SKU
- [x] Customers CRUD with unique email
- [x] Orders with inventory check + auto stock deduction
- [x] Auto-calculated `total_amount`
- [x] Stock restoration on order deletion
- [x] Dashboard stats (totals + low stock)
- [x] Responsive admin UI (mobile + desktop)
- [x] Form validation (frontend + backend)
- [x] Toast notifications for all actions
- [x] Docker + Docker Compose (one-command startup)
- [x] Environment variable configuration
- [x] Swagger API docs at `/docs`
- [x] Deployment-ready (Railway + Vercel)
