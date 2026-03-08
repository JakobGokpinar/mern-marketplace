# Rego — Secondhand Marketplace

## Stack
MERN (MongoDB, Express, React 18, Node.js). Vite + TypeScript frontend.

## Architecture
- `client/` → React frontend, deployed on Vercel (`rego.jakobg.tech`)
- `server/` → Express backend, deployed on Railway
- MongoDB Atlas for database

## Frontend Structure
- `src/main.tsx` — entry point (createRoot, Provider, QueryClientProvider)
- `src/App.tsx` — routing (BrowserRouter, lazy imports, useSocket, onUnauthorized effect)
- `src/components/` — shared components (Navbar, Footer, ProductCard, ProtectedRoute, ErrorBoundary, Skeleton)
- `src/pages/` — page-level components
- `src/hooks/` — custom hooks (useAuth, useFavorites, useSocket, useNorwayGeo, useChat, useChatSocket, useDebounce, useFormValidation)
- `src/services/` — pure API functions using instanceAxs (no Redux)
- `src/store/` — Redux (auth only: userSlice, authThunks, hooks)
- `src/lib/` — axios.ts, authEvents.ts, socket.ts, queryClient.ts, queryKeys.ts
- `src/types/` — shared TypeScript interfaces (user.ts, product.ts, chat.ts, geo.ts)
- `src/schemas/` — Zod validation schemas (auth.schema.ts, annonce.schema.ts, profile.schema.ts)
- `src/utils/` — cropImage.ts, dataURltoFile.ts, formatPrice.ts, timeago.ts

## Backend Structure (domain modules)
- `server/modules/auth/` — login, signup, logout, email verification (routes, controller, schema)
- `server/modules/user/` — profile, favorites, fetch/find users (routes, controller, schema)
- `server/modules/listing/` — CRUD, search, browse listings (routes, controller, schema)
- `server/modules/chat/` — conversations, messages, unread (routes, controller, schema)
- `server/models/` — Mongoose models (UserModel, AnnonceModel, ConversationModel, EmailVerifyToken)
- `server/services/` — shared logic (s3.js)
- `server/middleware/` — ensureAuth, validate (Zod), csrf, upload (multer)
- `server/config/` — db, passport, sendEmail, logger, validateEnv

## State Management
- **Server state**: TanStack Query v5 (useQuery / useMutation)
- **Auth state**: Redux Toolkit (userSlice only)
- **Norway geo data**: `useNorwayGeo` hook with `staleTime: Infinity` — no Redux slice
- **Typed dispatch/selector**: always use `useAppDispatch` / `useAppSelector` from `src/store/hooks`

## Auth / 401 Handling
- `src/lib/authEvents.ts` — tiny EventTarget emitter (no store imports, no circular dep)
- `axios.ts` interceptor calls `emitUnauthorized()` on 401 (skips `/login`, `/signup`)
- `App.tsx` subscribes via `onUnauthorized()` → dispatches logout + toast

## Design System
- All styles use CSS variables defined in `client/src/design.css`
- Primary: `#0D9488` (teal). See `design.css` for full palette.
- Bootstrap 5 + custom CSS Modules. NO MUI.
- System font stack, no external fonts.
- Norwegian language UI — don't translate existing Norwegian text.

## CSS Pattern
- All component styles are **CSS Modules** (`.module.css`). Import as `import styles from './Foo.module.css'`.
- To target Bootstrap classes inside a module: `:global(.bootstrap-class) { ... }`
- Global tokens and Bootstrap overrides stay in `design.css` (imported globally in `main.tsx`)
- `App.css` is global (layout shell only)

## Rules
- Never add new npm dependencies without asking
- Never touch working features when fixing styling
- Use `import.meta.env.VITE_API_URL` for API URL (not `REACT_APP_*`)
- TypeScript is the standard — all new files must be `.ts` or `.tsx`
- No inline styles unless absolutely necessary
- Keep `console.log` out of committed code
- Install packages with `npm install`

## Env Vars (client/.env)
```
VITE_API_URL=http://localhost:3080       # backend URL
VITE_SITE_URL=http://localhost:3000      # frontend URL (used for share links; https://rego.jakobg.tech in production)
```
