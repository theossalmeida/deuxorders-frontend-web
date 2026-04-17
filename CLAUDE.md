@AGENTS.md
@.claude/rules/nextjs.md

# DeuxOrders Web

Order management dashboard for Deuxcerie. Authenticated SPA-style app built with Next.js App Router.

## Stack

- **Next.js 16** — App Router, `src/` layout, no Pages Router
- **React 19** — Server Components default; `"use client"` only where needed
- **TypeScript** — strict, no `any`
- **Tailwind CSS v4** — utility-first; no inline styles except dynamic values
- **shadcn/ui + Radix UI** — sole component system; never mix in other UI frameworks
- **TanStack React Query v5** — all server state; no ad-hoc fetch in components
- **React Hook Form + Zod v4** — forms and validation
- **Axios** — HTTP client via `src/lib/api/client.ts`; API token injected per-request

## Project Structure

```
src/
  app/
    (protected)/          # Auth-gated routes — layout wraps Sidebar + BottomNav
      cash/               # Cash flow section
      clients/
      dashboard/
      orders/
      products/
    api/                  # Route handlers (Next.js API routes)
    login/
    layout.tsx            # Root layout — QueryProvider + Toaster + Geist font
    globals.css
  components/
    layout/               # Sidebar, BottomNav, MobileHeader
    orders/               # Order-specific components
    providers/            # QueryProvider
    ui/                   # shadcn/ui base components
  hooks/                  # One hook per domain (useOrders, useClients, …)
  lib/
    api/                  # Per-domain API factories (createOrdersApi, etc.)
    auth/                 # session.ts, role.ts
    format.ts
    image-ref.ts
    utils.ts
  types/                  # Shared TypeScript types
```

## Auth Pattern

- Session managed via `src/lib/auth/session.ts` and `src/lib/auth/role.ts`
- `(protected)` route group enforces auth at the layout level
- API calls use a token retrieved from the session; injected by `createApiClient(token)`

## API Layer

- Backend: `https://api-orders.deuxcerie.com.br`
- Dev proxy: `http://localhost:5047`
- Pattern: `createXxxApi(token)` factory in `src/lib/api/` returns typed method objects
- Image uploads go directly to R2 presigned URLs via `uploadToPresignedUrl()`

## Key Conventions

- All pages under `(protected)` are `"use client"` CSR pages backed by React Query hooks
- Custom hooks in `src/hooks/` own query keys, fetching logic, and mutations
- `setQueryData` updates must go through `normalizeOrder()` — never write raw API responses into cache
- shadcn `Select.Value` requires a render-function child for custom labels
- shadcn `Button` with `asChild` + `Link` needs `nativeButton={false}`
- Sidebar active-state logic for prefix-route conflicts (`/cash` vs `/cash/dashboard`) lives in `Sidebar.tsx`
- UI language: Portuguese (pt-BR)

## Security Posture

- CSP, HSTS, X-Frame-Options, and other headers set in `next.config.ts`
- `'unsafe-inline'` on script/style is a known limitation of the current setup — avoid widening further
- No sensitive data in localStorage; tokens via server-side session only
- Rate limiting applied at `src/lib/rate-limit/`
