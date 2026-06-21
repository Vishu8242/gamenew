# Khan Matka Arena - Frontend Documentation

The frontend is built as a highly polished, high-performance, single-page React 19 application powered by **Vite** and styled with **Tailwind CSS**. It delivers a premium, immersive dark cosmic-themed experience with fluid interactions, balanced negative space, and elegant typography.

## Core Directories & File Structure

```text
/src
├── components/          # Reusable UI components
│   ├── LiveResult.tsx   # Fetches and renders live game results
│   ├── ResultBoard.tsx  # Board displaying latest winning combinations
│   └── Header.tsx       # Dynamic high-contrast navigation bar
├── context/
│   └── GameContext.tsx  # Global state manager for users, markets, and transactions
├── pages/               # Primary routed screens & view canvases
│   ├── Dashboard.tsx    # active gaming arenas and single/jodi/triple boards
│   ├── Wallet.tsx       # Direct manual upi claim system & gateway payouts
│   ├── BetHistory.tsx   # Historical records and active/resolved wager metrics
│   ├── AdminDashboard.tsx # Control panel to execute market result declarations
│   └── Login.tsx        # Firebase-backed user credentials sheet
├── App.tsx              # Application layout router
├── main.tsx             # DOM entry point
├── index.css            # Global CSS setup injecting typography and tailwind presets
└── types.ts             # Shared application TypeScript interface definitions
```

## Aesthetic & Design Guidelines

1. **Luxury Palette & Themes**: The application utilizes a customized dark-mode aesthetic featuring deep pitch-blacks, slate-colored containers (`bg-zinc-950`), and premium high-contrast yellow/amber linear gradients.
2. **Typography**:
   - **Serif Display**: Used for high-stakes card headings to convey a premium club atmosphere.
   - **JetBrains Mono**: Used for numerical scores, transaction references, dates, and live status tickers to reinforce analytical precision.
   - **Inter Sans-Serif**: Backs the primary inputs, controls, body copy, and labels for universal accessibility and legibility.
3. **Responsive Adaptation**: Touch-targets are designed mobile-first with minimum boundaries of `44px`, scale to bento-grid modular layouts on widescreen monitors, and handle resizing dynamically without layout jumps.

## State Management & Gateway Integration

- **React Context**: All game states, user profile snapshots, notices, and market timing statuses are synchronized in unified hooks via `/src/context/GameContext.tsx`.
- **Firebase Sync**: Users, active bets, transaction history, and live game notices are queried and synced in real-time with Firebase Firestore.
- **Wallet Actions**:
  - Contains **Direct UPI / Manual Deposits** with custom QR-Code scan instructions and 12-digit transaction UTR claims.
  - Supports automated payouts processing via the custom backend proxy layer.
