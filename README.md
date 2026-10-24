# DarkMail --- Secure Email Platform

DarkMail is a full-stack email-style messaging application built with
**React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and
**Microsoft SQL Server (MSSQL)**. It provides role-based access for
administrators and employees, message composition and management, and
administrative tools for managing employee accounts.

> **Project note:** This README documents the project structure and
> setup based on the features and technology discussed for DarkMail.
> Folder and file names can vary slightly in your local copy. Keep your
> existing filenames and routes if they differ.

------------------------------------------------------------------------

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Architecture Overview](#architecture-overview)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Environment Variables](#environment-variables)
-   [Database Setup](#database-setup)
-   [Run the Application](#run-the-application)
-   [Main API Areas](#main-api-areas)
-   [Authentication and
    Authorization](#authentication-and-authorization)
-   [Activity Logging](#activity-logging)
-   [Troubleshooting](#troubleshooting)
-   [Security Notes](#security-notes)
-   [Development Workflow](#development-workflow)

------------------------------------------------------------------------

## Features

### Employee / User

-   Sign in using authenticated credentials.
-   View and manage the inbox.
-   Compose and send messages.
-   Reply, reply all, and forward messages.
-   View sent messages and drafts.
-   Move messages to Trash and manage deleted messages.
-   View message details, including recipients and thread information.
-   Mark messages as read.
-   Use a responsive mail interface.

### Administrator

-   Admin dashboard.
-   Create, view, edit, and manage employee accounts.
-   Role-based access to administrative pages.
-   Manage employee information and account status where implemented.
-   Review activity logs / activity records where configured.

### Platform

-   React single-page frontend.
-   REST API using Express.
-   JWT-based authentication.
-   SQL Server data persistence.
-   Password hashing.
-   Centralized error handling and API middleware.
-   Responsive layout using Tailwind CSS.

------------------------------------------------------------------------

## Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technologies
  ----------------------------------- -----------------------------------
  Frontend                            React, Vite, JavaScript, Tailwind
                                      CSS

  Routing                             React Router

  HTTP requests                       Fetch or Axios, depending on the
                                      service module

  Backend                             Node.js, Express.js

  Database                            Microsoft SQL Server (MSSQL)

  Database driver                     `mssql` / Tedious

  Authentication                      JSON Web Tokens (JWT)

  Password security                   `bcryptjs`

  Configuration                       Environment variables via `.env`

  Deployment                          Frontend/backend can be deployed
                                      separately, for example to Vercel
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Project Structure

The following is a recommended full structure for the DarkMail codebase.
Use it as a guide and retain any additional files already present in
your project.

``` text
DarkMail/
├── README.md
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.svg
│   │   └── ...
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── assets/
│       │   └── ...
│       ├── components/
│       │   ├── common/
│       │   │   ├── Loader.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── ...
│       │   ├── layout/
│       │   │   ├── MainLayout.jsx
│       │   │   ├── MailLayout.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Topbar.jsx
│       │   │   └── ...
│       │   └── mail/
│       │       ├── ComposeModal.jsx
│       │       ├── MessageViewer.jsx
│       │       ├── InboxList.jsx
│       │       └── ...
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── services/
│       │   ├── api.js
│       │   ├── authApi.js
│       │   ├── employeeApi.js
│       │   └── messageApi.js
│       ├── utils/
│       │   ├── auth.js
│       │   └── ...
│       └── pages/
│           ├── auth/
│           │   ├── Login.jsx
│           │   └── ...
│           ├── user/
│           │   ├── UserDashboard.jsx
│           │   ├── Inbox.jsx
│           │   ├── Sent.jsx
│           │   ├── Drafts.jsx
│           │   ├── Trash.jsx
│           │   └── ...
│           └── admin/
│               ├── AdminDashboard.jsx
│               ├── AdminRoutes.jsx
│               ├── Employees.jsx
│               ├── CreateEmployee.jsx
│               ├── EditEmployee.jsx
│               └── ...
│
└── backend/
    ├── package.json
    ├── package-lock.json
    ├── server.js
    ├── app.js
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── employeeController.js
    │   ├── messageController.js
    │   └── ...
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   └── ...
    ├── models/
    │   ├── Employee.js
    │   ├── Message.js
    │   └── ...
    ├── repositories/
    │   └── ...
    ├── routes/
    │   ├── authRoutes.js
    │   ├── employeeRoutes.js
    │   ├── messageRoutes.js
    │   └── ...
    ├── services/
    │   ├── employeeRepository.js
    │   ├── emailService.js
    │   └── ...
    ├── utils/
    │   ├── activityLogger.js
    │   ├── httpError.js
    │   └── ...
    └── logs/
        └── (generated at runtime; do not commit sensitive logs)
```

### What the main folders are for

**Frontend** - `components/`: reusable UI elements and mail
components. - `components/layout/`: application shell, sidebar, topbar,
and mail layout. - `components/mail/`: compose modal, message viewer,
and message list UI. - `context/` and `hooks/`: authentication state and
reusable React hooks. - `services/`: API request functions. -
`pages/user/`: employee mail pages. - `pages/admin/`: admin dashboard
and employee management screens.

**Backend** - `config/`: database and application configuration. -
`controllers/`: request handling and response construction. -
`middleware/`: JWT verification, role checks, and error handling. -
`models/`: data definitions or model-related logic. - `repositories/`:
database access logic. - `routes/`: REST API endpoint definitions. -
`services/`: reusable business logic, such as employee queries and email
delivery. - `utils/`: shared helpers, errors, and activity logging. -
`logs/`: runtime log output if file logging is enabled.

> If your implementation uses a different separation (for example, SQL
> queries directly in repositories rather than model classes), document
> the actual approach and avoid maintaining duplicate layers that your
> app does not use.

------------------------------------------------------------------------

## Architecture Overview

``` text
Browser
  |
  | React UI / React Router
  v
Frontend API service
  |
  | HTTP + Authorization: Bearer <JWT>
  v
Node.js / Express REST API
  |
  +--> Authentication and role middleware
  |
  +--> Routes / Controllers / Services
  |
  v
Microsoft SQL Server
```

The frontend should call the backend through a configurable API base
URL. The backend validates incoming requests, checks authentication and
authorization where required, runs database operations, and returns JSON
responses.

------------------------------------------------------------------------

## Prerequisites

Install the following before starting:

-   Node.js (use a current LTS version).
-   npm.
-   Microsoft SQL Server (local instance or hosted database).
-   SQL Server Management Studio (SSMS), or another SQL client.
-   Git (optional, for version control).

Confirm your tools are available:

``` bash
node --version
npm --version
```

------------------------------------------------------------------------

## Installation

### 1. Get the source code

Clone your repository or open your existing DarkMail project directory.

``` bash
git clone <your-repository-url>
cd DarkMail
```

Replace `<your-repository-url>` with your repository's actual clone URL.

### 2. Install backend dependencies

``` bash
cd backend
npm install
```

### 3. Configure the backend environment

Create a `.env` file inside `backend/` based on `.env.example`. Set the
SQL Server connection values, JWT secret, and any optional mail-service
settings.

### 4. Install frontend dependencies

Open another terminal:

``` bash
cd DarkMail/frontend
npm install
```

Create the frontend `.env` file based on `frontend/.env.example`.

------------------------------------------------------------------------

## Environment Variables

The exact names depend on your implementation. A typical configuration
may look like this.

### `backend/.env`

``` env
PORT=3000
NODE_ENV=development

# SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=DarkMail
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Authentication
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=2h

# Frontend origins (use your actual frontend URL)
CLIENT_URL=http://localhost:5173

# Optional: configure only if your email service is implemented
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

Your database configuration may instead use variables such as
`DB_DATABASE`, `DB_TRUST_CERT`, or a single connection string. **Use the
variable names read by your actual backend code.** Do not paste a real
password or production secret into this README.

Generate a strong JWT secret locally and store it only in your
environment configuration. Never commit `.env` files.

### `frontend/.env`

For a Vite frontend, environment variables exposed to browser code
generally need the `VITE_` prefix. For example:

``` env
VITE_API_BASE_URL=http://localhost:3000/api
```

Ensure the frontend API service reads the same variable name. Do not put
database credentials or server-only secrets in frontend environment
variables.

------------------------------------------------------------------------

## Database Setup

1.  Start your SQL Server instance.
2.  Open SSMS and connect to the correct server/instance.
3.  Create the database if it does not already exist.
4.  Run your project's table-creation scripts in dependency order.
5.  Configure the backend `.env` with the same server, database, and
    authentication details.
6.  Start the backend and verify the database connection using your
    implemented health/test endpoint.

Example database creation:

``` sql
CREATE DATABASE DarkMail;
GO
```

The exact schema must match the SQL queries and repository code in your
project. Common entities in this application include employee accounts,
messages, recipients, and message/thread metadata. Do not run a generic
schema over an existing database without checking your current tables
and migrations first.

If your project includes a test endpoint such as `/api/test`, use the
exact route implemented in your server to verify connectivity. Do not
expose database details or stack traces in a public production health
endpoint.

------------------------------------------------------------------------

## Run the Application

Run the backend in one terminal:

``` bash
cd backend
npm run dev
```

If your backend does not define a `dev` script, use the script listed in
`backend/package.json`, for example:

``` bash
npm start
```

Run the frontend in a second terminal:

``` bash
cd frontend
npm run dev
```

Vite usually prints the local frontend address, commonly
`http://localhost:5173`. The backend commonly listens on
`http://localhost:3000`, depending on your configuration.

### Suggested `package.json` scripts

Only add these if they match the packages and entry points used by your
project.

Backend example:

``` json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Frontend Vite example:

``` json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

------------------------------------------------------------------------

## Main API Areas

The exact paths and HTTP methods should be verified against your Express
route files.

  -----------------------------------------------------------------------
  API area                            Purpose
  ----------------------------------- -----------------------------------
  `/api/auth`                         Login, authentication, and
                                      session/token-related operations

  `/api/employees`                    Employee listing and employee
                                      administration

  `/api/messages`                     Message composition, listing,
                                      reading, sending, and message
                                      actions

  `/api/test`                         Optional development database/API
                                      connectivity test, if implemented
  -----------------------------------------------------------------------

Examples of likely operations include: - Authenticate a user and return
a JWT. - Fetch employees for recipient selection. - List
inbox/sent/draft messages. - Send a message to selected recipients. -
Mark a message as read. - Reply, reply all, or forward a message. - Move
a message to Trash or restore it. - Create or update employee records as
an administrator.

Use the actual route files as the source of truth for endpoint paths,
request bodies, response formats, and authorization requirements.

------------------------------------------------------------------------

## Authentication and Authorization

-   The backend should verify JWTs for protected endpoints.
-   The frontend may store the token in the configured authentication
    mechanism (the project has used `localStorage` with the key
    `darkmail_auth`).
-   Protected routes should prevent unauthenticated users from opening
    restricted pages.
-   Admin-only endpoints must enforce the administrator role on the
    backend, not only by hiding frontend links.
-   Passwords must be hashed before storage; never store plaintext
    passwords.
-   Handle expired tokens by returning the user to the login flow and
    clearing invalid authentication state.

For higher-security production deployments, evaluate using secure,
`HttpOnly`, `SameSite` cookies instead of storing access tokens in
browser-accessible storage.

------------------------------------------------------------------------

## Activity Logging

If the activity logger is enabled, it can record events such as
sign-in/sign-out, employee administration, and message actions. Keep log
entries useful for troubleshooting and auditing while avoiding
unnecessary sensitive content.

Recommended practices: - Record timestamps and the relevant user or
employee identifier. - Avoid logging passwords, JWTs, reset tokens,
message bodies, or other sensitive data. - Restrict access to log files
and database activity records. - Apply a retention policy and rotate log
files. - Ensure the runtime log directory exists and is writable by the
application process.

------------------------------------------------------------------------

## Troubleshooting

### SQL Server connection fails

-   Confirm SQL Server is running.
-   Check the server name and instance name.
-   Enable TCP/IP if connecting over TCP.
-   Confirm the configured port and firewall rules.
-   Verify the database name and credentials.
-   Ensure the SQL Server authentication mode matches the configured
    login.
-   Confirm encryption and certificate settings match your environment.

### `config.server` is required

The `mssql` configuration must receive a valid server name string. Check
that the environment variable is loaded and that its name matches the
code.

### Login failed for SQL user

Check the username/password, SQL Server authentication mode, login
permissions, and database access.

### JWT secret configuration error

Set a strong `JWT_SECRET` in the backend environment. If the project
enforces a minimum secret length, satisfy that requirement. Restart the
backend after changing environment variables.

### Frontend gets `401 Unauthorized`

-   Sign in again and confirm the token is valid.
-   Check whether the API request includes the expected
    `Authorization: Bearer <token>` header.
-   Confirm the frontend and backend agree on token format and expiry.
-   Verify that the requested endpoint requires the current user's role.

### CORS error

-   Add the exact frontend origin to the backend CORS allowlist.
-   Check scheme, hostname, port, and trailing slash differences.
-   Do not use a broad wildcard origin with credentials in production.

### Frontend API requests target the wrong host

Verify `VITE_API_BASE_URL` and the API service implementation.
Rebuild/restart the frontend after changing Vite environment variables.

### Reply / Reply All / Forward opens with empty fields

Confirm the message viewer sends the selected mode and original message
data to the compose handler, and confirm the parent component passes
that data to `ComposeModal` as `initialData`. Also ensure draft-loading
or reset effects do not clear `initialData` after it has been applied.

------------------------------------------------------------------------

## Security Notes

-   Never commit `.env`, database passwords, JWT secrets, email
    credentials, or private keys.
-   Use a different JWT secret in development and production.
-   Validate and authorize all input on the backend.
-   Use parameterized SQL queries; do not concatenate untrusted values
    into SQL statements.
-   Apply rate limiting to login and password-reset endpoints.
-   Use HTTPS in production.
-   Restrict CORS to trusted frontend origins.
-   Avoid returning stack traces, SQL errors, or secrets to clients.
-   Keep dependencies updated and review security advisories.
-   Back up the database before schema changes.

------------------------------------------------------------------------

## Development Workflow

1.  Create a feature branch before larger changes.

2.  Implement UI behavior in the relevant React component.

3.  Keep API requests inside service modules where possible.

4.  Add or update backend routes, controllers, and database operations
    as needed.

5.  Test authentication, roles, message actions, and error states.

6.  Run a production frontend build before deployment:

    ``` bash
    cd frontend
    npm run build
    ```

7.  Review environment variables and CORS settings before deployment.

8.  Never deploy development secrets or test database credentials.

------------------------------------------------------------------------

## Deployment Checklist

-   [ ] Production SQL Server is reachable by the backend.
-   [ ] Production environment variables are configured securely.
-   [ ] A strong production `JWT_SECRET` is configured.
-   [ ] Frontend API URL points to the deployed backend.
-   [ ] Backend CORS allowlist contains the deployed frontend origin.
-   [ ] Database schema is applied and backed up.
-   [ ] Admin routes and APIs enforce role authorization.
-   [ ] No secrets or `.env` files are committed.
-   [ ] Frontend production build succeeds.
-   [ ] Login, inbox, compose, reply, reply all, forward, drafts, trash,
    and admin flows are tested.

------------------------------------------------------------------------

## License

Add the license that applies to your project. If this repository is
private or intended for academic/internal use, state that explicitly.
