# Khan Matka Arena - Backend Documentation

The backend is a robust full-stack **Express** and **Node.js** application. It performs secure backend-to-gateway API operations, runs developmental Vite middlewares, and serves statically compiled files inside containerized Cloud Run deployments.

## Core File & Server Architecture

```text
/
├── server.ts      # Server entry point, API middleware definition, and live routing
├── package.json   # Handles compilation, runtime commands, and server scripts
├── tsconfig.json  # TypeScript configuration flags
└── .env.example   # Declares required local environment flags (e.g. RUPAYEX_API_TOKEN)
```

## Primary Services & Operations

### 1. Developer Vite Asset Middleware
- In local development runs, the server checks if `process.env.NODE_ENV !== "production"`.
- If true, it dynamically loads and injects a Vite Development Server in `middlewareMode: true` with standard `appType: "spa"`.
- This unifies API routes and UI assets on a single PORT `3000` for simple, compliant container ingress.

### 2. Live Bank Gateway Proxy Routing
- Proxies all communications through clean, server-side `/api/pay/*` endpoints. This ensures API credentials (such as standard user auth tokens) are completely concealed from consumer web browsers:
  - `GET /api/pay/wallet-balance` - Queries current real-time ledger holdings.
  - `POST /api/pay/create-order` - Handles immediate Rupayex deposit creations.
  - `GET /api/pay/order-status` - Checks and verifies specific deposit UTR states.
  - `POST /api/pay/create-payout` - Mounts verified customer bank accounts and processes real payouts.
  - `GET /api/pay/payout-status` - Audits settlement statuses on the gateway ledger.

### 3. Graceful Simulation Fallbacks
- To prevent deployment blockage when actual third-party API credentials are not set up or configured, the endpoints automatically detect error state responses and fall back to high-fidelity, interactive simulator behaviors (e.g. returning custom `/checkout-simulation` URLs so user playflows remain completely unblocked).

## Compilation & Run commands

```json
"scripts": {
  "dev": "tsx server.ts",
  "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs"
}
```

- **Development**: Run via `npm run dev` to execute direct TypeScript type-stripping dynamically.
- **Production Build**: Run via `npm run build` which bundles Vite frontend files and compiles the backend into a single, highly-optimized CommonJS file `dist/server.cjs` via `esbuild`.
- **Runtime execution**: Launches fast and lightweight in production via `npm start`.
