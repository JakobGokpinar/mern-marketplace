# Rego — Secondhand Marketplace

## Stack
MERN (MongoDB, Express, React 18, Node.js). Vite frontend, TypeScript.

## Architecture
- client/ → React frontend, deployed on Vercel (rego.jakobg.tech)
- server/ → Express backend, deployed on Railway
- MongoDB Atlas for database

## Frontend Structure
- `src/main.tsx` — entry point (createRoot, Provider, QueryClientProvider)
- `src/App.jsx` — routing, lazy imports, useSocket
- `src/components/` — shared components (Navbar, Footer, ProductCard, FeedbackBanner, ProtectedRoute, ErrorBoundary)
- `src/pages/` (mapped as `src/Pages/`) — page-level components
- `src/hooks/` — custom hooks (useAuth, useFavorites, useSocket, useNorwayGeo, useChat, useDebounce)
- `src/services/` — pure API functions using instanceAxs (no Redux)
- `src/store/` — Redux (auth + UI only: userSlice, uiSlice, authThunks)
- `src/lib/` — axios instance, socket, queryClient, queryKeys
- `src/types/` — shared TypeScript interfaces

## State Management
- **Server state**: TanStack Query v5 (useQuery / useMutation)
- **Auth + UI state**: Redux Toolkit (userSlice, uiSlice only)
- **appDataSlice removed** — Norway geo data is fetched via `useNorwayGeo` hook (staleTime: Infinity)

## Design System
- All styles use CSS variables defined in client/src/design.css
- Primary: #0D9488 (teal). See design.css for full palette.
- Bootstrap 5 + custom CSS. NO MUI (fully removed).
- System font stack, no external fonts.
- Norwegian language UI — don't translate existing text.

## Rules
- Never add new npm dependencies without asking
- Never touch working features when fixing styling
- Use `import.meta.env.VITE_API_URL` for API URL (not REACT_APP_*)
- TypeScript is the standard — new files should be .ts or .tsx
- Follow existing CSS-per-component pattern (ComponentName.css)
- No inline styles unless absolutely necessary
- Keep console.log out of committed code
- Install packages with `npm install --legacy-peer-deps` (chatscope requires React 17 peer dep)
