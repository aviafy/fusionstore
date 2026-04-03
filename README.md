# Ecommerce Website (Fusion)

A full-stack ecommerce application with a **React 18 + TypeScript + Vite** frontend (Tailwind CSS, shadcn/ui) and a **Node.js / Express 5** backend. Product data, NFTs, freelancer services, users, and orders are stored in **MongoDB** via Mongoose.

## Features

- **Product catalog** — API-driven listing with filters, categories, text search, and pagination; product detail with similar items and ratings (authenticated).
- **NFT gallery** — On-chain-style metadata from the API; detail pages with collections and attributes.
- **Freelancer services** — Listings from MongoDB; contact form (authenticated); contact history (`GET /api/freelancer-contact/mine`).
- **Shopping cart** — Client-side cart (in-memory for the session).
- **Checkout** — **Stripe** Payment Element (USD) when `VITE_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are set; **crypto demo** order path (authenticated).
- **Auth** — Register / login; JWT stored in `localStorage` for the SPA and sent as `Authorization: Bearer`; httpOnly cookies also set by the API when applicable.
- **Orders** — Track by order number + email (`FE-` + 12 hex chars).
- **API documentation** — Swagger UI at `/api-docs`.

## Tech stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 18, TypeScript, React Router 6, TanStack Query, Tailwind, shadcn/ui, Framer Motion, Stripe.js, Vite |
| Backend  | Express 5, Mongoose, Stripe, Helmet, CORS, rate limiting, express-validator |
| Tooling  | Concurrently, Jest, mongodb-memory-server (API tests) |

## Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** running locally or a cloud URI (`MONGO_URI`)

## Quick start

```bash
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, optional STRIPE_* and VITE_STRIPE_PUBLISHABLE_KEY

npm install
npm start
```

- Backend: **5050** by default (host `0.0.0.0`). On macOS, **avoid port 5000** — it is often used by AirPlay Receiver and will return **403** to proxied `/api` calls, so the shop looks empty.
- Frontend (Vite): **3000** with `/api` proxied to `PORT` from `.env`. Ensure `CLIENT_ORIGIN` includes `http://localhost:3000` for CORS.

### Stripe webhooks (local)

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to `POST /api/checkout/webhook` and set `STRIPE_WEBHOOK_SECRET` from the CLI output.

## Environment

See **`.env.example`** for `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`, and optional admin seed vars.

The repo may include a local `.npmrc` with `ignore-scripts=true`. For packages that need install scripts, use `npm install --ignore-scripts=false` when adding them.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm start` | Backend + Vite dev server |
| `npm run build` | Production frontend build (`build/`) |
| `npm run preview` | Preview production build |
| `npm test` | Jest (API tests with in-memory MongoDB) |

## License

MIT — see `package.json` for author metadata.
