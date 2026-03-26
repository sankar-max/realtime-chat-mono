# Real-Time Chat System: Monorepo Architecture Guide

As your system scales to support a Hono API, a WebSocket server, a Next.js web app, and an Expo React Native app, getting the monorepo architecture right early on is critical. This guide outlines production-grade patterns for structuring your Turborepo, managing dependencies, and ensuring robust type safety.

## 1. High-Level Directory Structure

A clean Turborepo structure segregates deployable **apps** from reusable **packages**. Keep your packages focused and strictly scoped.

```text
realtime-chat-mono/
├── apps/
│   ├── api/                 # Hono REST/RPC API
│   ├── ws/                  # WebSocket server (Stateful, real-time)
│   ├── web/                 # Next.js Web App (Future)
│   └── mobile/              # Expo React Native App (Future)
├── packages/
│   ├── schema/              # DB schemas (Drizzle/Prisma models)
│   ├── validation/          # Zod schemas (API validation, UI forms)
│   ├── ws-protocol/         # WebSocket payload types and message routers
│   ├── events/              # Pub/Sub event schemas (Redis/Kafka)
│   ├── config/              # Shared ESLint, TSConfig, ENV validation
│   └── ui/                  # Shared React components (Future)
```

**Key Principle:** Apps depend on packages, but **packages should almost never depend on apps**. Packages should depend on each other linearly (a Directed Acyclic Graph - DAG).

---

## 2. Dependency Management & Preventing Circular Dependencies

A common pitfall in monorepos is creating massive "common" or "shared" packages. Instead, create granular, highly cohesive packages.

### The Dependency Hierarchy (Bottom-Up)

1. **`@chat/config`**: No internal dependencies. (TS configs, ESLint).
2. **`@chat/validation`**: Depends only on external libs (e.g., `zod`). Holds DTOs and API payload validations.
3. **`@chat/schema`**: Depends on `@chat/validation`. Contains database definitions. It exports types inferred from your DB driver but shouldn't export Zod schemas (keep those in `validation`).
4. **`@chat/ws-protocol`**: Depends on `@chat/validation`. Defines the exact JSON structure of WebSocket messages (`{ type: "MESSAGE_CREATED", payload: ... }`).
5. **`@chat/events`**: Depends on `@chat/validation`. Defines internal server-to-server Pub/Sub events (e.g., Redis channels).

### Preventing Circular Dependencies
- **Never import an app into a package.**
- **Extract interfaces:** If Package A needs something from Package B, and B needs something from A, extract a new Package C containing the shared interfaces/types, and make both A and B depend on C.
- **Use `eslint-plugin-import`:** Configure the `import/no-cycle` rule in `@chat/config/eslint` to catch circular dependencies at build time.

---

## 3. Reusable Shared Packages (Backend & Clients)

To safely share code between Node.js (Backend) and Browser/React Native (Clients):

- **Isomorphic Code Only:** Things like `@chat/validation` and `@chat/ws-protocol` must contain **only** standard TypeScript and Zod. They cannot contain Node.js core modules (`fs`, `crypto`) or DB drivers (like `pg` or `mongodb`). 
- **Package `exports` fields:** Ensure your `package.json` correctly uses the `"exports"` field to handle module resolution for different environments (CJS vs. ESM vs. React Native).

```json
// Example packages/validation/package.json
{
  "name": "@chat/validation",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

---

## 4. Flow of Data & Events (API vs. WebSocket)

With a decoupled API and WebSocket architecture, you must handle the fact that HTTP requests hit the API, while clients maintain persistent connections to the WS server. 

### The Recommended Architecture (Pub/Sub Pattern)

1. **Client Action**: The client (Next.js/Expo) sends an HTTP POST `/messages` to the **API (Hono)**.
2. **Persistence**: The API validates the request using `@chat/validation`, saves it to the DB using `@chat/schema`, and creates a response.
3. **Internal Event**: The API publishes a message to a **Redis Pub/Sub** channel (using types from `@chat/events`).
4. **WebSocket Push**: The **WS Servers** subscribe to Redis. Upon receiving the `MESSAGE_CREATED` event, the WS server formats the payload (using `@chat/ws-protocol`) and pushes it down the active WebSocket connection to the relevant clients.

**Why not send messages straight via WebSocket?**
Sending mutations (writes) via HTTP and receiving updates (reads) via WebSockets keeps authentication, rate limiting, and standard REST/tRPC practices simple for writes, while letting WebSockets focus purely on highly scalable, fast data pushing.

---

## 5. Type Safety and End-to-End Consistency

You want to know instantly if changing a database column breaks the mobile app.

### A. API Layer (Hono RPC or tRPC)
Since you are using Hono, utilize **Hono RPC**. Hono allows you to export the `AppType` from your backend. Your `web` and `mobile` apps can import this type safely at build time (dev-only dependency) to get end-to-end typed fetching.
```typescript
// apps/web/src/api.ts
import { hc } from 'hono/client'
import type { AppType } from '@chat/api' // Type-only import!

export const client = hc<AppType>('http://localhost:3000')
```

### B. WebSocket Layer
Use `@chat/ws-protocol` to define a strict discriminated union for all incoming and outgoing messages.

```typescript
// packages/ws-protocol/src/index.ts
import { z } from 'zod';
import { MessageSchema } from '@chat/validation';

export const ServerToClientMessage = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('MESSAGE_CREATED'),
    payload: MessageSchema,
  }),
  z.object({
    type: z.literal('USER_TYPING'),
    payload: z.object({ userId: z.string(), roomId: z.string() })
  })
]);

export type ServerToClient = z.infer<typeof ServerToClientMessage>;
```
Both the WS Server and the Clients import `ServerToClientMessage` to validate WebSocket frames at runtime.

---

## Next Steps for You
1. Set up standard `tsconfig.json` bases in `@chat/config` extending `tsconfig/strictest`.
2. Move all your Zod schemas out of your `api` app and into `@chat/validation`.
3. Scaffold `@chat/ws-protocol` to strictly type the WebSocket payload layer.
