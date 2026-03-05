# Rego — Project Tracker

## Done

### Infrastructure & Architecture

- Monorepo migration (two separate repos → one)
- Deploy frontend → Vercel (`rego.jakobg.tech`)
- Deploy backend → Railway
- MongoDB Atlas connection + auth fixes
- Migrate CRA → Vite + React 18 (createRoot, Suspense, React.lazy code splitting)
- Add TypeScript — all frontend files migrated to `.ts` / `.tsx`
- Migrate aws-sdk v2 → `@aws-sdk/client-s3` v3
- Upgrade Mongoose 5 → 8, connect-mongo 4 → 6, Node engine → ≥22
- Remove direct `mongodb` driver dep (Mongoose bundles it), remove Pino (simple console logger)
- Upgrade Passport `0.4` → `0.7`
- Zod input validation on all route endpoints (middleware + schemas)
- Pagination on homepage feed and search results (page/limit, "Last inn flere" button)
- Test infrastructure: Vitest + Supertest (23 tests: validate middleware, Zod schemas, ensureAuth)
- CSRF protection: double-submit cookie pattern (csrf-csrf), auto-attached via axios interceptor
- Chat message pagination: backend returns last 50 messages, "Load older" button in UI
- Loading skeletons: shimmer placeholders replace Spinners on homepage + search results
- Frontend form validation: Zod schemas + useFormValidation hook on all forms (Login, Register, NewAnnonce, Profile)
- Dev/prod environment separation (MONGO_URL_DEV / MONGO_URL_PROD, NODE_ENV guards)
- Backend restructure: routes → controllers → services → models

### Frontend Architecture

- Environment variables — all `REACT_APP_*` replaced with `VITE_*`
- Remove MUI dependency completely (~1.5 MB bundle reduction, 5 fewer deps)
- Replace Redux thunks with TanStack Query v5 for all server state
- Slim Redux down to auth only (userSlice)
- Add ProtectedRoute — route-level auth guards (removed modal-based auth)
- Add custom hooks: `useAuth`, `useFavorites`, `useSocket`, `useNorwayGeo`, `useChat`, `useChatSocket`, `useDebounce`, `useFormValidation`
- Add service layer: `authService`, `productService`, `chatService`, `profileService`, `favoriteService`, `emailService`
- Break apart NewAnnonce (~700 lines) → `AnnonceForm`, `AnnoncePreview`, `ImageManager`, `SpecialPropsEditor`
- Extract chat logic → `useChat` + `useChatSocket` hooks (Chat.tsx is layout-only)
- CSS Modules — all component styles scoped (`.module.css`)
- Fix Axios circular dependency — EventTarget-based `authEvents.ts` instead of dynamic store imports
- Fix double `postNumber` state in NewAnnonce — single source of truth via `useDebounce`
- Fix Chat.tsx `var` mutation-during-render — replaced with `groupMessagesBySender()` pure function (also fixed direction bug)
- Fix FilterBadge double state — direct derivation from `searchParams`, no useState/useEffect
- React Router v7 future flags opted in
- Replace `@chatscope/chat-ui-kit-react` with custom chat components
- Replace `FeedbackBanner` with `react-hot-toast` across all key actions

### Security & Backend

- Rotate exposed credentials (AWS, MongoDB, Gmail, session secret)
- Remove hardcoded session secret
- Fix `fetchUser.js` auth bypass
- Enable `strict: true` on UserModel schema
- Clean `auth.js` (remove debug logs, commented code, debug endpoint)
- Delete dead file `yedek.js`
- Security + clean code pass on all backend controllers
- Extract reusable `ensureAuth` middleware — DRY `req.isAuthenticated()` checks
- Extract S3 operations into shared `services/s3.js`
- Replace scattered `console.log`/`console.error` with centralized logger module
- Add env var validation at startup (`config/validateEnv.js`)
- Add per-file size limits (5 MB) + MIME filter + filename sanitization to multer (`middleware/upload.js`)
- Add `/api` prefix architecture (single Vite proxy rule, clean route namespace)
- Add Helmet security headers + rate limiting on auth endpoints
- Add database indexes (unique email, sellerId, category, buyer/seller/productId)
- Optimize favorites query — `$in` instead of fetch-all + JS filter
- Add backend guard preventing users from favoriting their own listings

### Design

- Teal design system (`design.css` — CSS variables, color palette, shadows, transitions)
- Bootstrap 5 (MUI fully removed)
- Homepage redesign (CSS Grid, responsive)
- ProductCard redesign (floating favorite, image count badge, hover actions, formatted prices)
- ProductPage redesign (seller card, info cards, breadcrumbs, formatted prices)
- Footer rebrand (teal scheme, dynamic copyright year)
- Navbar redesign (pill search bar, "Ny Annonse" CTA, icon links, avatar dropdown)
- Login / Register pages redesigned (teal design system)
- Fix FeedbackBanner `setInterval` → `setTimeout` (memory leak)
- Fix Navbar scroll/socket listener leaks

### Code Quality

- Remove inline styles — ProductCard spinner → CSS class, SearchResult marginBottom → CSS Module gap
- Use axios params object instead of template string interpolation in services
- Replace `User | Record<string, never>` with `User | null` in userSlice
- Fix array `.map()` keys — replaced `key={index}` with stable IDs throughout
- Safe regex match in `dataURltoFile.ts`
- Auth thunks extract backend error messages from axios error responses
- Axios 401 interceptor skips auth paths (`/login`, `/signup`)
- Add lazy loading for product images (`loading="lazy"`)

### Features

- Delete account — full cascading cleanup (S3 images, annonces, conversations, favorites, user document)
- `useAppDispatch` / `useAppSelector` — typed Redux hooks used consistently throughout

---

## Bugs

- **Profile naming** — `pages/Profile/` has a sub-page also named `Profile/Profile/`. Confusing. Suggested structure: `Account/` (hub) → `Settings/` (edit name/photo), `MyAnnonces/`, `Favorites/`.
- **Chat: wrong profile photo** — The other person's photo doesn't always render correctly. Needs verification.

---

## Improvements

- Expand test coverage: API integration tests with DB, component tests (auth, favorites, annonce creation)
- Verify logout clears all cached data: Redux state, localStorage, sessionStorage, TanStack Query cache
- AWS IAM — App currently uses root account credentials for S3. Create an IAM user with least-privilege S3 permissions.
- Email verification dev bypass — Fake emails can't receive 2FA codes, requiring manual DB edits to flip `isEmailVerified`. Add a dev-mode bypass (e.g. fixed OTP `000000` when `NODE_ENV=development`).
- Validate file magic bytes, not just MIME type, for uploads
- Compress images before upload (client-side, e.g. `browser-image-compression`) — reduces S3 storage costs, improves load times
- Dark mode using the existing CSS variable system — default to OS preference (`prefers-color-scheme`), with a manual toggle
