# Rego — Project Tracker

## Done

- Codebase audit (security, architecture, deps, dead code)
- Monorepo migration (two repos → one)
- Environment variables (replaced all hardcoded URLs)
- Deploy frontend to Vercel (`rego.jakobg.tech`)
- Deploy backend to Railway (`mern-marketplace-production-a3e2.up.railway.app`)
- Fix MongoDB auth + dependency conflicts
- Fix Node version for Vercel
- Fix `fetchUser.js` auth bypass
- Enable `strict: true` on UserModel schema
- Remove hardcoded session secret
- Replace hardcoded siteLink in ProductCard.js
- Rotate exposed credentials (AWS, MongoDB, Gmail, session secret)
- Delete dead file `yedek.js`
- Clean `auth.js` (remove debug logs, commented code, debug endpoint)
- Teal design system (`design.css` — CSS variables, color palette, shadows, transitions)
- Homepage redesign (CSS Grid layout, responsive)
- ProductCard redesign (floating favorite, image count badge, hover actions, formatted prices)
- ProductPage redesign (seller card, info cards, breadcrumbs, formatted prices)
- Footer rebrand (teal scheme, dynamic copyright year, removed old "Rego.no")
- Remove MUI dependency completely (~1.5MB bundle reduction, 5 fewer deps)
  - FeedbackBanner.js → Bootstrap Alert
  - Navbar.js → img + CSS avatar placeholder
  - FilterBadge.js → custom Bootstrap-styled badge
  - Profile/Profile.js → img + CSS avatar placeholder
  - Conversations.js → img + CSS avatar placeholder
  - NewAnnonce.js → FontAwesome trash icon + CSS backdrop overlay
  - Filters.js → removed redundant MUI Tooltip wrappers
- Fix FeedbackBanner `setInterval` → `setTimeout` (memory leak)
- Fix Navbar scroll listener leak (added cleanup)
- Fix Navbar socket listener leak (added cleanup)
- Fix Navbar 3x duplicate chatroom API calls → 1 with useCallback
- Remove redundant `user` state mirroring Redux in Navbar
- Fix Conversations.js async useEffect bug
- Clean `index.js` (removed dead reportWebVitals import)

## To Do — Short Term (Portfolio-Ready)

- Polish Login/Register pages (teal design system)
- Polish Profile edit page (remove stripe background)
- Polish Search results page (teal refinement)
- Clean up README with screenshots and architecture diagram
- Remove remaining `console.log` statements across codebase
- Remove `eslint-disable` comments where possible
- Add proper error handling middleware to Express

## To Do — Long Term (Full Refactor)

- Migrate CRA → Vite
- React 17 → 18+ (ReactDOM.render → createRoot)
- Add TypeScript
- Replace Bootstrap with Tailwind CSS (during Vite migration)
- Backend restructure (routes → controllers → services → models)
- Mongoose 5 → 8, aws-sdk v2 → @aws-sdk/client-s3 v3
- Remove annonces from user document (reference by ID only)
- Break apart NewAnnonce.js (~400 lines) into smaller components
- Break apart Chat.js (~200 lines, 12+ useEffects)
- Replace Redux thunks with React Query / TanStack Query
- Proper route guards (replace modal-based auth)
- Add form validation (Zod + React Hook Form)
- Add tests (API integration + component tests)
- Pagination for listings
- Loading skeletons / proper loading states

