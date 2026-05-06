# 💸 FinTrack Pro (Budget and Expense Tracker)

Track spending, set category budgets, and view analytics in a clean dashboard UI. 📊

## ✨ Why this project

- ✅ **Real-life value**: helps control expenses and stick to monthly/category limits.
- 🧠 **Full‑stack practice**: JWT auth, REST APIs, DB schema design, and frontend integration.
- 🚀 **Portable**: one Node/Express server serves both the API + static frontend.

## 🔥 Features

- 🔐 JWT authentication (register, login, profile update, change password)
- 🧾 Transactions (add/list/delete, income vs expense, categories)
- 🐷 Budgets by category (set/update/list/delete)
- 📈 Analytics + dashboard views (served from static HTML)
- 🏗️ Auto database schema initialization on server start

## 🧰 Tech stack

- 🟩 Backend: Node.js, Express
- 🗄️ Database: MySQL (via `mysql2`)
- 🪪 Auth: JSON Web Tokens (`jsonwebtoken`)
- 🎨 Frontend: Static HTML/CSS/JS (served from `views/`)

## 🗂️ Project structure

- `server.js` - Express app + route mounting + static frontend hosting 🧩
- `config/db.js` - MySQL pool + `initSchema()` (creates tables on startup) 🏗️
- `routes/` - API route definitions 🛣️
- `controllers/` - Route handlers (business logic) 🧠
- `middleware/auth.js` - JWT verification middleware 🛡️
- `views/` - Frontend (`index.html`, `dashboard.html`) 🖥️

## ✅ Requirements

- Node.js 18+ (recommended) 🟢
- MySQL 8+ (or compatible MySQL server) 🐬

## 🧑‍💻 Setup (run on another system)

### 1) Install dependencies 📦

```bash
npm install
```

### 2) Create a MySQL database 🗄️

Create a database (name can be anything, but must match `DB_NAME`):

```sql
CREATE DATABASE FinTrack_db;
```

### 3) Configure environment variables 🔑

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=FinTrack_db
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```

Notes:
- `JWT_SECRET` must be set, or login/auth will fail. ⚠️
- The app auto-creates tables on startup (see `config/db.js`). ✅

### 4) Start the server ▶️

Development (auto-restart):

```bash
npm run dev
```

Production:

```bash
npm start
```

Open in your browser 🌐:
- Frontend: `http://localhost:5000/`
- Dashboard: `http://localhost:5000/dashboard.html`

## 🧪 API overview

All endpoints are prefixed with `/api`. Most require an `Authorization: Bearer <token>` header after login. 🧾

### 🔐 Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (auth required)
- `PUT /api/auth/profile` (auth required)
- `POST /api/auth/change-password` (auth required)

### 🧾 Transactions (auth required)

- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`

### 🐷 Budgets (auth required)

- `GET /api/budgets`
- `POST /api/budgets` (upsert by category)
- `DELETE /api/budgets/:category`

## 🛠️ Common issues

- ❌ **"Invalid or expired token"**: login again; ensure `JWT_SECRET` is the same across runs.
- 🧩 **Database connection errors**: verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and that MySQL is running.
- 🔁 **Port already in use**: change `PORT` in `.env`.
