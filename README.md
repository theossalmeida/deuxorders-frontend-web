# DeuxOrders Web

Web order management system for **Deuxcerie** — a responsive Next.js replication of the [iOS app](https://github.com/theossalmeida/deuxorders-frontend-ios).

## Features

- **Dashboard** — revenue charts, top products, top clients, date range filters, CSV/PDF export
- **Orders** — list with search, status and date filters, create and edit orders with reference image uploads
- **Products** — grid view, create/edit with image upload, active/inactive toggle
- **Clients** — list with search, create/edit, active/inactive toggle
- **Authentication** — secure login with multi-layer rate limiting and session management

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner |

## Security

- JWT stored in an **httpOnly, SameSite=strict** cookie — never exposed to JavaScript
- **Proxy middleware** blocks every unauthenticated request server-side
- **Multi-layer rate limiter** on login: sliding window per IP + device fingerprint cookie (prevents multi-tab bypass), plus a hard IP cap as a second layer
- **Client-side exponential backoff** after consecutive failures with a visible countdown
- Backend hardening guide available in `rate_limiter_backend.md` (gitignored)

## Getting Started

### Prerequisites

- Node.js 18+
- Access to the Deuxcerie API (or a local instance at `http://localhost:5062`)

### Installation

```bash
git clone https://github.com/theossalmeida/deuxorders-frontend-web.git
cd deuxorders-frontend-web
npm install
```

### Environment

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_API_URL=https://api-orders.deuxcerie.com.br/api/v1
```

For local development against a local API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5062/api/v1
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until authenticated.

## Project Structure

```
src/
├── app/
│   ├── (protected)/        # Auth-gated pages (dashboard, orders, products, clients)
│   ├── api/auth/           # Login, logout, and token API routes
│   └── login/              # Public login page
├── components/
│   ├── dashboard/          # Summary cards, revenue chart, top products chart
│   ├── layout/             # Sidebar, bottom nav, mobile header
│   ├── orders/             # Order card, status badge, item form
│   ├── clients/            # Client form
│   ├── products/           # Product form
│   ├── providers/          # React Query provider
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # Data-fetching hooks per domain
├── lib/
│   ├── api/                # Typed API service functions per domain
│   ├── auth/               # JWT cookie session helpers
│   ├── rate-limit/         # Server-side rate limiter
│   └── format.ts           # Currency and date formatters
└── types/                  # TypeScript types per domain
```

## API Reference

All requests go to the backend at `NEXT_PUBLIC_API_URL`. Authentication uses `Authorization: Bearer <token>` on every request except `POST /auth/login`.

See the full API contract in the [iOS repository](https://github.com/theossalmeida/deuxorders-frontend-ios/blob/main/API_REFERENCE.md).

## Related

- [iOS App](https://github.com/theossalmeida/deuxorders-frontend-ios) — original SwiftUI client
