# DarkMail

A starter monorepo with a React frontend and a Node.js backend.

## Project structure

```text
DarkMail/
  frontend/                    # React + Vite UI
    src/
      components/              # reusable UI pieces
      features/compose/        # compose feature
      features/inbox/          # inbox feature
  backend/                     # Node + Express API
    src/
      controllers/
      services/
      repositories/            # file-backed message repository
      routes/
      middleware/
    data/messages.json         # local JSON persistence (starter only)
  package.json                 # workspace scripts
```

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Run backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:3001` by default.

### 3) Run frontend

In a second terminal:

```bash
npm run dev:frontend
```

Frontend runs on Vite's default dev port and calls the backend at `http://localhost:3001`.

## Implemented features

- Backend health check endpoint: `GET /health`
- Backend messages API:
  - `GET /api/messages`
  - `POST /api/messages` with JSON body `{ "subject": "...", "body": "..." }`
- Backend persistence in `backend/data/messages.json` through `MessagesRepository`
- Frontend compose form that submits messages and refreshes inbox
- Frontend inbox list that reads from the backend

## Backend testing

```bash
npm run test:backend
```

The test suite validates message input and verifies repository-backed persistence.

## What to learn next

1. Replace JSON persistence with SQLite/PostgreSQL and migrations.
2. Add authentication and protect message endpoints.
3. Add request schema validation middleware.
4. Add linting/formatting (`eslint`, `prettier`) and CI checks.
