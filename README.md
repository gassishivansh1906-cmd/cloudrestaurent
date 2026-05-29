# 🍽️ CloudRestaurant — Full-Stack Restaurant SaaS

A production-style, multi-page restaurant SaaS web application. Customers can browse the
menu, order online, book tables and contact the restaurant; owners get a secure admin
dashboard. The whole stack is **containerized with Docker**, ships via a **GitHub Actions
CI/CD pipeline**, and deploys to **AWS EC2**.

---

## 🧱 Architecture

```
                         ┌──────────────────────────────────────────┐
   Internet  ───────────▶│  EC2 instance (Docker + docker compose)   │
                         │                                            │
                         │  ┌────────────┐   /api    ┌─────────────┐  │
                         │  │  frontend  │ ────────▶ │   backend   │  │
                         │  │ (Nginx :80)│           │ (Node :5000)│  │
                         │  └────────────┘           └──────┬──────┘  │
                         │                                  │         │
                         │                          ┌───────▼──────┐  │
                         │                          │ SQL Server   │  │
                         │                          │  (db :1433)  │  │
                         │                          └──────────────┘  │
                         └──────────────────────────────────────────┘
```

| Layer       | Tech                                   | Folder       |
|-------------|----------------------------------------|--------------|
| Frontend    | React 18 + Vite + React Router (Nginx) | `frontend/`  |
| Backend API | Node.js + Express + JWT auth           | `backend/`   |
| Database    | Microsoft SQL Server (SSMS 22)         | `database/`  |
| Orchestration | Docker + docker-compose              | root         |
| CI/CD       | GitHub Actions → SSH → EC2             | `.github/`   |
| Deployment  | AWS EC2 + shell scripts                | `deploy/`    |

### Folder structure

```
cloudrestaurent/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # ALL pages live here (Home, Menu, About, Pricing,
│   │   │                     #   Reservation, Contact, Cart, Login, Register,
│   │   │                     #   Dashboard, NotFound)
│   │   ├── components/       # Navbar, Footer, ProtectedRoute, SectionTitle
│   │   ├── context/          # Auth + Cart React contexts
│   │   ├── api/              # API client (fetch wrapper)
│   │   ├── styles/           # global.css design system
│   │   ├── App.jsx           # routing
│   │   └── main.jsx
│   ├── Dockerfile            # multi-stage build → Nginx
│   └── nginx.conf            # serves SPA + proxies /api → backend
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/db.js      # SQL Server pool + admin seeding
│   │   ├── controllers/      # auth, menu, reservations, orders, contact
│   │   ├── middleware/       # JWT auth + admin guard
│   │   ├── routes/           # /api router
│   │   └── server.js
│   └── Dockerfile
├── database/                 # SQL Server scripts (run in SSMS 22)
│   ├── schema.sql            # tables
│   └── seed.sql              # categories + menu sample data
├── deploy/                   # EC2 bootstrap + deploy scripts
│   ├── ec2-setup.sh
│   └── deploy.sh
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick start (Docker — recommended)

The fastest way to run **everything** (DB + API + web) locally:

```bash
# 1. Copy env and adjust the password/secret
cp .env.example .env

# 2. Build and start all services
docker compose up -d --build

# 3. Open the app
#    Frontend : http://localhost
#    API      : http://localhost:5000/health
```

The `db-init` container automatically creates the `CloudRestaurant` database and loads
sample data. The backend creates the admin account on first start.

**Default admin login:** `admin@cloud.com` / `Admin@123`

Stop everything with `docker compose down` (add `-v` to also wipe the database volume).

---

## 🛠️ Local development (without Docker)

### 1. Database (SQL Server via SSMS 22)
1. Open **SSMS 22** and connect to your SQL Server instance.
2. Open and execute `database/schema.sql` (creates the DB + tables).
3. Open and execute `database/seed.sql` (loads categories + menu items).
4. Make sure **SQL Server Authentication** is enabled and you have a SQL login
   (e.g. `sa`) — the Node backend connects with username/password.

### 2. Backend
```bash
cd backend
cp .env.example .env      # set DB_SERVER=localhost, DB_USER, DB_PASSWORD
npm install
npm run dev               # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api → :5000)
```

---

## 🗄️ Connecting to SQL Server (SSMS 22)

| Setting        | Local instance              | Docker container       |
|----------------|-----------------------------|------------------------|
| Server name    | `localhost` or `.\SQLEXPRESS` | `localhost,1433`     |
| Authentication | SQL Server Authentication   | SQL Server Authentication |
| Login          | `sa` (or your SQL login)    | `sa`                   |
| Password       | your password               | value of `DB_PASSWORD` |

> The Dockerized SQL Server publishes port **1433**, so you can connect SSMS 22 directly
> to `localhost,1433` to inspect data while the stack runs.

---

## 🔌 API reference

| Method | Endpoint                | Auth   | Description                |
|--------|-------------------------|--------|----------------------------|
| POST   | `/api/auth/register`    | –      | Create customer account    |
| POST   | `/api/auth/login`       | –      | Log in, returns JWT        |
| GET    | `/api/auth/me`          | JWT    | Current user               |
| GET    | `/api/categories`       | –      | List menu categories       |
| GET    | `/api/menu`             | –      | List menu items (`?featured=true`, `?categoryId=`) |
| POST   | `/api/menu`             | admin  | Add menu item              |
| DELETE | `/api/menu/:id`         | admin  | Delete menu item           |
| POST   | `/api/reservations`     | –      | Create reservation         |
| GET    | `/api/reservations`     | admin  | List reservations          |
| PATCH  | `/api/reservations/:id` | admin  | Update reservation status  |
| POST   | `/api/orders`           | –      | Place an order             |
| GET    | `/api/orders`           | admin  | List orders                |
| POST   | `/api/contact`          | –      | Send contact message       |
| GET    | `/api/contact`          | admin  | List messages              |
| GET    | `/health`               | –      | Health check               |

---

## ☁️ AWS EC2 deployment

See the full step-by-step guide in [`deploy/AWS_DEPLOYMENT.md`](deploy/AWS_DEPLOYMENT.md).
Short version:

1. **Launch EC2** — Ubuntu 24.04, `t3.medium` (SQL Server needs ≥ 2 GB RAM; 4 GB recommended).
2. **Security group** — open inbound `22` (SSH, your IP), `80` (HTTP), and optionally `5000`.
3. **Bootstrap** the instance:
   ```bash
   ssh -i key.pem ubuntu@<EC2_IP>
   bash deploy/ec2-setup.sh     # installs Docker + compose
   ```
4. **Deploy** — clone the repo, create `.env`, then `docker compose up -d --build`.
5. Visit `http://<EC2_PUBLIC_IP>`.

---

## 🔁 CI/CD pipeline (GitHub Actions)

`.github/workflows/ci-cd.yml` runs on every push to `main`:

1. **build-test** — installs deps, builds the frontend, syntax-checks the backend, and
   validates `docker-compose.yml`.
2. **deploy** — SSHes into EC2, pulls the latest `main`, writes `.env` from secrets, and
   runs `docker compose up -d --build`.

### Required GitHub repository secrets
Set these under **Settings → Secrets and variables → Actions**:

| Secret           | Example / meaning                              |
|------------------|------------------------------------------------|
| `EC2_HOST`       | EC2 public IP or DNS                           |
| `EC2_USER`       | `ubuntu`                                        |
| `EC2_SSH_KEY`    | Contents of your `.pem` private key            |
| `APP_DIR`        | `/home/ubuntu/cloudrestaurent`                 |
| `REPO_URL`       | `https://github.com/<you>/cloudrestaurent.git` |
| `DB_PASSWORD`    | SQL Server SA password                         |
| `JWT_SECRET`     | long random string                             |
| `CLIENT_ORIGIN`  | `http://<EC2_IP>`                              |
| `ADMIN_NAME`     | `Restaurant Admin`                             |
| `ADMIN_EMAIL`    | `admin@cloud.com`                              |
| `ADMIN_PASSWORD` | admin password                                 |

---

## 🔐 Security notes
- Passwords are hashed with **bcrypt**; sessions use **JWT**.
- API protected with **helmet**, **CORS** and **rate limiting**.
- Order prices are recalculated server-side (clients can't tamper with totals).
- Never commit `.env` — only `.env.example` is tracked.

---

## 📜 License
MIT — built as a full-stack SaaS reference project.
