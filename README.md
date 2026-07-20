# Shopora — Server

Express 5 + Mongoose 9 REST API for the Shopora e-commerce platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript 7 (CommonJS output)
- **ODM:** Mongoose 9
- **Validation:** Zod v4
- **Authentication:** better-auth (session-based, Bearer token against `session` collection)
- **Payments:** Stripe (Checkout Sessions)
- **Dev runner:** tsx (watch mode)
- **Deploy:** Vercel (app exported as default handler, no `vercel.json` needed)

## How It Works

The server provides a RESTful JSON API mounted under `/api`. Endpoints:

| Prefix | Module | Auth |
|---|---|---|
| `/api/products` | Product CRUD + paginated listing with search/filter/sort | Public read, no auth for write |
| `/api/cart` | Shopping cart (add, update, remove, clear) | Bearer token |
| `/api/orders` | Order creation and retrieval | Bearer token |
| `/api/payments` | Stripe Checkout session creation + payment verification | Bearer token |
| `/api/users` | Admin: list and delete users | Bearer token + admin role |
| `/api/dashboard` | Admin: sales stats, charts data, low stock alerts | Bearer token + admin role |

### Auth Flow

Authentication is handled by better-auth on the client side. The server validates sessions by checking the Bearer token against the `session` collection in MongoDB (populated by better-auth). No JWT signing or password hashing happens on the server — those utilities are stubs.

### Architecture

- **Controllers** contain all business logic (services layer is stubs)
- **Middleware** handles auth, validation (Zod), and error formatting
- **Models** define Mongoose schemas (orders, products, cart, payments)
- **Validations** use Zod schemas for request body validation
- **Error middleware** handles Mongoose ValidationError, duplicate key (11000), CastError, and generic 500s

## Setup

```bash
npm install
cp .env.example .env   # or use existing .env
npm run dev            # tsx watch, port 9000
```

### Required env vars

- `MONGODB_URI` — MongoDB connection string
- `STRIPE_SECRET_KEY` — Stripe secret key (for payments)
- `CLIENT_URL` — defaults to `http://localhost:3000`

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server with hot reload (port 9000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/server.js` |
