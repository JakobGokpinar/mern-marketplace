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
- Frontend form validation: Zod schemas + useFormValidation hook on Login/Register forms

### Frontend Architecture

- Environment variables — all `REACT_APP_*` replaced with `VITE_*`
- Remove MUI dependency completely (~1.5 MB bundle reduction, 5 fewer deps)
- Replace Redux thunks with TanStack Query v5 for all server state
- Slim Redux down to auth + UI only (userSlice, uiSlice)
- Add ProtectedRoute — route-level auth guards (removed modal-based auth)
- Add custom hooks: `useAuth`, `useFavorites`, `useSocket`, `useNorwayGeo`, `useChat`, `useDebounce`
- Add service layer: `authService`, `productService`, `chatService`, `profileService`, `favoriteService`, `emailService`
- Break apart NewAnnonce (~700 lines) → `AnnonceForm`, `AnnoncePreview`, `ImageManager`, `SpecialPropsEditor`
- Extract chat logic → `useChat` hook (Chat.tsx is layout-only)
- CSS Modules — all component styles scoped (`.module.css`)
- Fix Axios circular dependency — EventTarget-based `authEvents.ts` instead of dynamic store imports
- Fix double `postNumber` state in NewAnnonce — single source of truth via `useDebounce`
- Fix Chat.tsx `var` mutation-during-render — replaced with `groupMessagesBySender()` pure function (also fixed direction bug)
- Fix FilterBadge double state — direct derivation from `searchParams`, no useState/useEffect
- React Router v7 future flags opted in

### Security & Backend

- Rotate exposed credentials (AWS, MongoDB, Gmail, session secret)
- Remove hardcoded session secret
- Fix `fetchUser.js` auth bypass
- Enable `strict: true` on UserModel schema
- Clean `auth.js` (remove debug logs, commented code, debug endpoint)
- Delete dead file `yedek.js`
- Security + clean code pass on all backend controllers

### Design

- Teal design system (`design.css` — CSS variables, color palette, shadows, transitions)
- Bootstrap 5 (MUI fully removed)
- Homepage redesign (CSS Grid, responsive)
- ProductCard redesign (floating favorite, image count badge, hover actions, formatted prices)
- ProductPage redesign (seller card, info cards, breadcrumbs, formatted prices)
- Footer rebrand (teal scheme, dynamic copyright year)
- Navbar redesign (pill search bar, "Ny Annonse" CTA, icon links, avatar dropdown)
- Fix FeedbackBanner `setInterval` → `setTimeout` (memory leak)
- Fix Navbar scroll/socket listener leaks

### Best-Practices Audit (medium-level)

- Remove inline styles — ProductCard spinner → CSS class, SearchResult marginBottom → CSS Module gap
- Split `useChat` hook — extracted socket logic to `useChatSocket` hook
- Use axios params object instead of template string interpolation in services
- Confirmed `profile-avatar` CSS in design.css is not dead (used in Profile.tsx)
- Confirmed `!important` flags are necessary for Bootstrap overrides in Navbar/Searchbar
- Extract reusable `ensureAuth` middleware — DRY `req.isAuthenticated()` checks across all route files
- Extract S3 operations from controllers into shared `services/s3.js`
- Replace scattered `console.log`/`console.error` with centralized logger module
- Add env var validation at startup (`config/validateEnv.js`)
- Add per-file size limits (5 MB) + MIME filter + filename sanitization to multer (`middleware/upload.js`)
- Add lazy loading for product images (`loading="lazy"`)
- Add `/api` prefix architecture (single Vite proxy rule, clean route namespace)
- Add Helmet security headers + rate limiting on auth endpoints
- Replace `User | Record<string, never>` with `User | null` in userSlice
- Fix array `.map()` keys — replaced `key={index}` with stable IDs throughout
- Safe regex match in `dataURltoFile.ts`
- Auth thunks extract backend error messages from axios error responses
- Axios 401 interceptor skips auth paths (`/login`, `/signup`)
- Add database indexes (unique email, sellerId, category, buyer/seller/productId)
- Optimize favorites query — `$in` instead of fetch-all + JS filter

### Features

- Delete account — full cascading cleanup (S3 images, annonces, conversations, favorites, user document)
- `useAppDispatch` / `useAppSelector` — typed Redux hooks used consistently throughout

---

## Bugs

- **Profile naming** — `Profile/` has a sub-page also named `Profile/Profile/`. Confusing for both users and devs. Suggested structure: `Account/` (hub) → `Settings/` (edit name/photo), `MyAnnonces/`, `Favorites/`.
- **Chat: wrong profile photo** — The other person's photo doesn't always render correctly. Frontend resolves user ID from chat model but the mapping may be off.
- **Chat: "Active now" always showing** — Online indicator is hardcoded active regardless of actual user state. Remove or implement real presence detection.
- **Favorites: users can favorite their own listings** — Frontend hides the button when `user._id === sellerId`, but no backend guard exists. Add a server-side check on the favorites endpoint.
- **My Annonces: crash on missing `annonceImages`** — Optional chaining added in frontend; investigate why some annonces are stored without this field (schema or creation flow bug).

---

## Improvements

### Code Quality (from best-practices audit)

- Validate file magic bytes, not just MIME type, for uploads

### UI Polish

- Login / Register pages (apply teal design system)
- Profile/Settings edit page (remove stripe background, cleaner layout)
- Search results page (teal refinement)
- Chat UI — replace `chatscope` library with a custom component matching the app's visual language

### Search

- Verify search handles partial matches, is case-insensitive, and ranks title match above description match
- Evaluate and possibly remove the secondary category suggestions bar below the navbar

### Create Annonce

- Enrich product categories (electronics, vehicles, clothing, furniture, sports — align with Finn.no)
- Evaluate "Nytt / Brukt" status field — make it more prominent or remove
- Verify image upload, preview, reorder, and delete end-to-end

### Performance


### Image Handling

- Compress images before upload (client-side, e.g. `browser-image-compression`)
- Reduces S3 storage costs, improves load times, prevents oversized images looking off in the UI

### Notifications

- Replace `FeedbackBanner` with `react-hot-toast`
- Cover all key actions: login, logout, register, favorites, profile update, new annonce, errors, unauthorized

### Logout

- Verify logout clears all cached data: Redux state, localStorage, sessionStorage, TanStack Query cache

### Dark Mode

- Add dark mode using the existing CSS variable system
- Default to OS preference (`prefers-color-scheme`), with a manual toggle in Settings

---

## Backend / Infrastructure

- **Backend restructure** — Routes are currently flat files in `server/`. Long-term: routes → controllers → services → models. Not urgent at current scale.
- **Server credentials** — Verify `mongo_url`, `email_user`, `aws_bucket_name` in `server/.env` are current and rotated.
- **Dev/prod environment separation** — Backend should never connect to the production DB during local dev. Add `.env.development` / `.env.production` split or `NODE_ENV` guards.
- **Email verification dev bypass** — Fake emails can't receive 2FA codes, requiring manual DB edits to flip `isEmailVerified`. Add a dev-mode bypass (e.g. fixed OTP `000000` when `NODE_ENV=development`).
- **AWS IAM** — App currently uses root account credentials for S3. Create an IAM user with least-privilege S3 permissions and rotate credentials.
- **Frontend form validation** — Consider React Hook Form + Zod on frontend (backend already has Zod).
- **More tests** — Expand test coverage: API integration tests with DB, component tests (auth, favorites, annonce creation).

---

## Long-term / Evaluate

- Replace Bootstrap with Tailwind CSS (during a future major refactor pass)
- Remove `annonces` array from user document — reference by ID only (requires DB migration)
- Build own chat components (remove `@chatscope/chat-ui-kit-react` dependency)
- Add pagination cursor to annonce feed (currently loads everything at once)

