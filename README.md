# Inventory & Order Management System

A production-ready full-stack Inventory & Order Management System built with **React**, **FastAPI**, and **PostgreSQL**, fully containerized with Docker.

---

## Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Frontend     | React 18, React Router v6     |
| Backend      | Python 3.12, FastAPI          |
| Database     | PostgreSQL 16                 |
| ORM          | SQLAlchemy 2.0                |
| Container    | Docker + Docker Compose       |
| Frontend CDN | nginx (Alpine)                |

---

## Live Deployment

| Service      | URL                                                                            |
| ------------ | ------------------------------------------------------------------------------ |
| Frontend     | https://inventory-and-order-management-syst-beta.vercel.app                    |
| Backend API  | https://inventory-and-order-management-system-production.up.railway.app        |
| API Docs     | https://inventory-and-order-management-system-production.up.railway.app/docs   |
| Health Check | https://inventory-and-order-management-system-production.up.railway.app/health |
| Docker Image | https://hub.docker.com/r/shiveshm46radha/inventory-backend                     |


---

## Project Structure

```
inventory-order-management/
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point, CORS setup, router registration
│   │   ├── database.py        # SQLAlchemy engine, session, and DB connection logic
│   │   ├── models.py          # ORM models (Product, Customer, Order)
│   │   ├── schemas.py         # Pydantic schemas for request/response validation
│   │   └── routers/
│   │       ├── products.py    # Product CRUD APIs
│   │       ├── customers.py   # Customer CRUD APIs
│   │       └── orders.py      # Order APIs with business logic (stock handling)
│   │
│   ├── requirements.txt       # Python dependencies (FastAPI, SQLAlchemy, etc.)
│   ├── Dockerfile             # Backend container setup (Python slim image)
│   └── .dockerignore          # Ignore unnecessary files during Docker build
│
├── frontend/
│   ├── src/
│   │   ├── index.jsx          # React entry point (ReactDOM root)
│   │   ├── App.jsx            # Main app component with routing & layout
│   │   ├── index.css          # Global styles and design system
│   │   │
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   ├── Topbar.jsx     # Header / top navigation
│   │   │   └── UI.jsx         # Shared UI elements (badges, loaders, etc.)
│   │   │
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.jsx  # Overview stats and low stock display
│   │   │   ├── Products.jsx   # Product management UI
│   │   │   ├── Customers.jsx  # Customer management UI
│   │   │   └── Orders.jsx     # Order creation and listing UI
│   │   │
│   │   └── services/
│   │       └── api.jsx        # Axios API layer to communicate with backend
│   │
│   ├── public/
│   │   └── index.html         # HTML template
│   │
│   ├── nginx.conf             # Nginx config for serving React build
│   ├── Dockerfile             # Multi-stage frontend build (Node → Nginx)
│   └── .dockerignore          # Ignore unnecessary files during Docker build
│
├── docker-compose.yml         # Orchestrates backend, frontend, and PostgreSQL
├── .env.example               # Environment variables template (safe for sharing)
├── schema.sql                 # Reference PostgreSQL schema (tables structure)
└── README.md                  # Project documentation and setup guide

```

---

## Quick Start (Docker)

### 1. Clone the repository

```bash
git clone https://github.com/shiveshmishra46/Inventory-and-Order-Management-System.git
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

## Business Logic

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
