# Docker Networking Architecture

## Problem

In a Dockerized Next.js application, we have two different execution contexts:

1. **Server-side** (Next.js Server Components) - runs inside Docker containers
2. **Client-side** (Browser JavaScript) - runs in the user's browser

Each context needs different URLs to access backend services.

## Solution

We use **two sets of environment variables**:

### 1. SERVER\_\* Variables (Internal Docker Network)

Used by Next.js Server Components running inside containers.

```env
SERVER_AUTH_SERVICE_URL=http://auth-service:8004
SERVER_PRODUCT_SERVICE_URL=http://product-service:8000
SERVER_ORDER_SERVICE_URL=http://order-service:8001
SERVER_PAYMENT_SERVICE_URL=http://payment-service:8002
```

**When to use:** In Server Components (async components, `getServerSideProps`, API routes)

**Example:**

```tsx
// apps/admin/src/app/(dashboard)/page.tsx
const Homepage = async () => {
  const data = await fetch(
    `${process.env.SERVER_ORDER_SERVICE_URL}/orders-varchart`,
    // ...
  );
};
```

### 2. NEXT*PUBLIC*\* Variables (Localhost)

Used by browser JavaScript running on the user's machine.

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8004
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:8002
```

**When to use:** In Client Components (`"use client"` directive, browser-side code)

**Example:**

```tsx
// apps/client/src/components/StripePaymentForm.tsx
"use client";

const getClientSecret = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/session/create-checkout-session`,
    // ...
  );
};
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                         │
│                                                               │
│  Client Components use NEXT_PUBLIC_* (localhost)            │
│  ↓                                                           │
│  http://localhost:8000  ────────────────────────┐           │
└─────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ↓
┌──────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│                                                               │
│  ┌──────────────┐    SERVER_* URLs    ┌──────────────┐     │
│  │   Admin      │ ──────────────────→  │   Product    │     │
│  │  Container   │  http://product-     │   Service    │     │
│  │              │  service:8000        │   :8000      │     │
│  └──────────────┘                      └──────────────┘     │
│                                                               │
│  ┌──────────────┐                      ┌──────────────┐     │
│  │   Client     │                      │   Order      │     │
│  │  Container   │                      │   Service    │     │
│  │   :3003      │                      │   :8001      │     │
│  └──────────────┘                      └──────────────┘     │
│         ↑                                                    │
│         │ Serves HTML/JS to browser                         │
└─────────┼──────────────────────────────────────────────────┘
          │
          └─── Browser downloads and executes client-side code
```

## Services Breakdown

| Service             | Type                | Uses                         | Reason                                                                      |
| ------------------- | ------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| **Admin**           | Next.js (SSR)       | `SERVER_*` + `NEXT_PUBLIC_*` | Server Components use `SERVER_*`, any client components use `NEXT_PUBLIC_*` |
| **Client**          | Next.js (CSR heavy) | `NEXT_PUBLIC_*`              | Mostly client-side rendering, browser needs localhost                       |
| **Product Service** | Fastify API         | N/A                          | Backend service, doesn't make external calls                                |
| **Order Service**   | Fastify API         | N/A                          | Backend service, doesn't make external calls                                |
| **Payment Service** | Hono API            | N/A                          | Backend service, doesn't make external calls                                |
| **Auth Service**    | Express API         | N/A                          | Backend service, doesn't make external calls                                |

## Key Takeaways

1. ✅ **Server Components** → Use `SERVER_*` (internal Docker names)
2. ✅ **Client Components** → Use `NEXT_PUBLIC_*` (localhost)
3. ✅ **Port Mapping** → All backend services expose ports to host machine
4. ✅ **Environment Files** → `.env.development` contains both sets of URLs

## Common Mistakes to Avoid

❌ **DON'T** use `http://product-service:8000` in client-side code

```tsx
"use client";
// This will fail! Browser can't resolve Docker service names
fetch(`http://product-service:8000/products`);
```

✅ **DO** use `NEXT_PUBLIC_*` in client-side code

```tsx
"use client";
// This works! Browser can access localhost
fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`);
```

❌ **DON'T** use `http://localhost:8000` in Server Components

```tsx
// Server Component (inside Docker)
// This might work but is inefficient - goes out to host then back
const data = await fetch(`http://localhost:8000/products`);
```

✅ **DO** use `SERVER_*` in Server Components

```tsx
// Server Component (inside Docker)
// Direct internal Docker network communication - faster!
const data = await fetch(`${process.env.SERVER_PRODUCT_SERVICE_URL}/products`);
```
