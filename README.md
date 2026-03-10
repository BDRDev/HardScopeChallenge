# Hard Scope Challenge

Monorepo with a **Vite + React + Mantine** frontend and a **Node.js + Express** backend.

## Prerequisites

- **Node.js** (LTS recommended, e.g. 18+)

## Project structure

- **`frontend/`** – Vite, React, TypeScript, Mantine
- **`backend/`** – Express, TypeScript

## How to run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at **http://localhost:3000**.

### From the repo root

You can start either service from the root:

```bash
npm run dev:frontend
npm run dev:backend
```

(Make sure to run `npm install` in `frontend` and `backend` at least once before using these.)

## API

- **`GET /`** – Returns `{ message: "Hello from Express" }`
- **`GET /api/health`** – Returns `{ status: "ok", timestamp: "..." }`

## Environment

- **Backend:** set `PORT` to change the server port (default: 3000).
- Add a `.env` file in `frontend` or `backend` as needed; do not commit secrets.
