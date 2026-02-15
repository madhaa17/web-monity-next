# Monity — Finance Tracker (Web)

A personal finance web app for tracking **assets**, **expenses**, **incomes**, and **saving goals**. It talks to the [Monity API](https://api-assetmonitor.my.id) (or a compatible backend) for auth and data.

## Features

- **Authentication** — Login and register; JWT stored in cookies (access token readable, refresh token httpOnly). Route protection via Next.js proxy (middleware); session and refresh handled by API routes.
- **Dashboard** — Overview with portfolio summary, cashflow, monthly trends, expense-by-category charts, recent activity, and saving-goal progress. Initial overview data can be server-rendered (hybrid SSR/CSR).
- **Assets** — List and manage assets (cash, crypto, stock, etc.); view asset detail with price chart.
- **Expenses** — List and manage expenses by category; requires at least one CASH asset.
- **Incomes** — List and manage income entries; requires at least one CASH asset.
- **Insights** — Monthly cashflow (income, expense, net saving, saving rate) and charts (trends, expense by category).
- **Saving goals** — Create and track goals with target amount, current amount, and optional deadline.

## Tech stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev)
- **Data & state** — [TanStack React Query](https://tanstack.com/query/latest) for server state; [Zustand](https://zustand-demo.pmnd.rs/) available
- **Tables** — [TanStack React Table](https://tanstack.com/table/latest) + [shadcn/ui Table](https://ui.shadcn.com/docs/components/table)
- **UI** — [shadcn/ui](https://ui.shadcn.com) (Radix, Tailwind), [Recharts](https://recharts.org), [Lucide](https://lucide.dev) icons, [Sonner](https://sonner.emilkowal.ski) toasts
- **Forms & validation** — [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev), [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **API** — [Axios](https://axios-http.com) for client requests; server-side fetch via `lib/api/server-client` with cookie-based auth

## Project structure (high level)

- `app/` — Routes: `/` (landing), `/login`, `/register`, `/dashboard` (overview, assets, expenses, incomes, insights, saving-goals)
- `app/api/auth/` — Session (set/read cookies), logout, refresh
- `components/` — UI primitives and dashboard blocks (overview, assets, expenses, incomes, insights, saving-goals)
- `hooks/` — Data hooks (e.g. `useOverviewData`, `useAssetsData`, `useExpensesData`), auth (`useAuth`, `useToken`, `useDashboardAuth`), forms
- `lib/` — API client, server client, auth cookies, queries, validations, formatting
- `proxy.ts` — Route protection and redirects (replaces deprecated `middleware.ts` in Next.js 16)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Create `.env.local` and set the API base URL:

   ```env
   NEXT_PUBLIC_API_URL=https://api-assetmonitor.my.id
   ```

   For local backend use `http://localhost:8080` (or your backend URL).

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use **Log in** or **Register**; after auth you’ll be redirected to the dashboard.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |

## Auth flow (summary)

- **Login/Register** — Client calls backend; on success, client POSTs tokens to `/api/auth/session`, which sets cookies. Redirect to `/dashboard`.
- **Protected routes** — `proxy.ts` reads `monity_token`; missing cookie on `/dashboard/*` redirects to `/login`.
- **API calls** — Client sends `Authorization: Bearer <token>` (token from cookie). On 401, client calls `/api/auth/refresh` (refresh token sent via cookie); new tokens set by response cookies; original request is retried.
- **Server-side** — `getServerToken()` and `serverFetch()` in `lib/api/server-client` use cookies for SSR or API routes.

## License

Private. See repository owner for terms.
