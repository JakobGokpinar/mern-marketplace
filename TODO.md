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
- Upgrade Mongoose 5 → 8

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

- Pagination or infinite scroll for home feed, search results, and profile sub-pages
- Chat: load messages paginated (currently loads all at once)
- Loading skeletons for product feeds during data fetching

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
- **Form validation** — Add Zod on backend (replace manual checks). Consider React Hook Form + Zod on frontend.
- **Tests** — API integration tests (backend routes) + component tests (auth, favorites, annonce creation).
- **Upgrade Passport** — `^0.4.1` → `^0.6.0` to formally match the async `req.logout(cb)` API the code already uses.

---

## Long-term / Evaluate

- Replace Bootstrap with Tailwind CSS (during a future major refactor pass)
- Remove `annonces` array from user document — reference by ID only (requires DB migration)
- Build own chat components (remove `@chatscope/chat-ui-kit-react` dependency)
- Add pagination cursor to annonce feed (currently loads everything at once)

