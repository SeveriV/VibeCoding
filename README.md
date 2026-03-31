# VibeCoding
Training at Microsoft

# StockWise — Inventory Management App

A modern web application for managing retail store inventory. Built with **React + Vite** (frontend) and **Node.js + Express + SQLite** (backend).

## Features

- 📦 **Browse products** in table or card grid view
- 🔍 **Search** products by name, SKU, or description
- 🏷️ **Filter** by category
- ➕ **Add products** via modal form with validation
- ✏️ **Edit products** — name, category, SKU, price, quantity and description
- 🗑️ **Delete products** with confirmation dialog
- 🔢 **Update quantity** inline with +/− buttons or direct input
- 📊 **Dashboard stats** — total products, inventory value, low stock & out-of-stock counts
- 🔔 **Toast notifications** for all actions
- 💾 **20 products pre-seeded** across 6 categories on first run

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 19, Vite 8              |
| Backend  | Node.js, Express 4            |
| Database | SQLite (via better-sqlite3)   |
| Styling  | Custom CSS with CSS variables |

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm run install:all
```

### Run the app (both frontend and backend)

```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run individually

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Project Structure

```
├── backend/
│   ├── server.js       # Express API server
│   ├── database.js     # SQLite setup & seed data (20 products)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── api.js               # API client functions
│   │   ├── components/
│   │   │   ├── ProductList.jsx  # Table & grid views with quantity controls
│   │   │   ├── ProductFormModal.jsx  # Add/edit product form
│   │   │   ├── ConfirmDialog.jsx     # Delete confirmation
│   │   │   └── Toast.jsx            # Notification toasts
│   │   ├── hooks/
│   │   │   └── useToast.js      # Toast notification hook
│   │   └── index.css            # Global styles
│   └── package.json
└── package.json        # Root scripts (uses concurrently)
```

## API Endpoints

| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | `/api/products`                 | List all products       |
| GET    | `/api/products?search=&category=` | Search/filter products |
| GET    | `/api/products/:id`             | Get single product      |
| POST   | `/api/products`                 | Create product          |
| PUT    | `/api/products/:id`             | Update product          |
| PATCH  | `/api/products/:id/quantity`    | Update quantity only    |
| DELETE | `/api/products/:id`             | Delete product          |
| GET    | `/api/categories`               | List all categories     |
