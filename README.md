# nova-invoice (InvoiceApp)

A full-stack invoice generation, management, and billing application supporting GST invoices, international export commercial invoices, e-Way bills, proforma invoices, and standard invoices.

## Tech Stack

- **Frontend**: Vite + Vanilla JS / SPA architecture (Inter & Outfit typography, Lucide Icons, responsive print/PDF stylesheets)
- **Backend**: Node.js (ES modules) + Express 5
- **Database**: MongoDB with Mongoose ODM
- **Security & Validation**: Helmet, express-rate-limit, custom NoSQL operator sanitization, Zod schema validation, bcryptjs password hashing, JWT authentication

## Features

- **Multi-Format Invoicing**: Supports GST Tax Invoices (with CGST/SGST/IGST breakdown), e-Way Bills (with procedural SVG Barcode & QR Code generators), Customs Commercial Export Invoices, Proforma Invoices, and Standard Consulting Invoices.
- **Server-Side Financial Accuracy**: Recalculates subtotals, tax distributions, discounts, and round-offs server-side to prevent tampering and floating-point errors.
- **Authentication & Multi-Tenant Isolation**: Secure register, login, profile management, and per-user invoice ownership enforcement.
- **Multi-Cloud Deployment**: Built for deployment as serverless functions on Netlify or as a containerized web service on Render.

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`) | `production` |
| `PORT` | Backend server port | `5000` |
| `HOST` | Host binding interface (`0.0.0.0` for Docker/cloud, `127.0.0.1` for local) | `0.0.0.0` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens (minimum 32 chars) | `your_secret_key` |
| `CORS_ORIGIN` | Comma-separated list of allowed origins (`*` for local dev only) | `*` |
| `VITE_API_URL` | Frontend API endpoint (optional; defaults to `/api` or `http://localhost:5000/api`) | `http://localhost:5000/api` |

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
```

### 3. Start Development Servers
Run the backend API server and the Vite dev server:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run server

# Terminal 2: Frontend Vite Dev Server (runs on http://localhost:5173)
npm run dev
```

Alternatively, build the frontend and serve everything unified from Express:
```bash
npm run start:prod
```

### 4. Run Automated Tests
```bash
npm test
```
Executes the comprehensive Vitest suite (all 14 unit and integration tests), covering:
- Server-side tax & financial calculations (IGST, CGST, SGST, discounts, decimal rounding)
- API endpoint health, security headers (Helmet), input validation (Zod)
- NoSQL injection sanitization
- Multi-tenant IDOR protection and JWT authentication
- Isolated testing powered by `mongodb-memory-server` (no external database required)

## CI/CD Pipeline

- **Continuous Integration** (`.github/workflows/ci.yml`): Runs on pull requests targeting `main`. Caches `mongodb-memory-server` binaries, verifies clean install with `npm ci`, executes `npm test`, and validates Vite asset bundling.
- **Continuous Deployment** (`.github/workflows/deploy.yml`): Runs on merge to `main`. Acts as a deployment gate by executing the test suite before triggering the Render webhook.

## Deployment Targets

### Netlify (Serverless)
- Configured via `netlify.toml`
- Static assets published from `dist/`
- Serverless functions routed under `netlify/functions`
- API calls redirected from `/api/*` to `/.netlify/functions/api/:splat`
- Subdirectories in `server/` bundled via `included_files` in `netlify.toml`

### Render / Docker (Web Service)
- Configured via `render.yaml` and `Dockerfile`
- Multi-stage Docker build using Node 20 Alpine
- Automated health check at `/api/health`
- Runs `npm start` (or `npm run start:prod`)
