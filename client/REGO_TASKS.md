# Rego – Bug Fixes & Improvement Tasks

This document is a structured task list for an AI coding assistant. Each section is labeled by type: **BUG** (broken functionality that must be fixed), **IMPROVEMENT** (existing feature that needs to be made better), or **FEATURE** (new functionality to add). Tasks are grouped by area of the application.

---

## AUTHENTICATION

### [BUG] Profile photo upload fails for authenticated users
- Uploading a new profile photo returns the error: `'You have to login to upload files'` even when the user is logged in.
- Investigate the file upload middleware/route — the authentication token is likely not being attached to the upload request. Check that the request includes the auth header and that the multer (or equivalent) middleware is positioned after the auth middleware in the route chain.

### [BUG] Profile photo preview breaks after cancelling file picker
- Steps to reproduce: User opens file picker to choose a new profile photo → clicks Cancel → opens file picker again and selects a photo → the image preview does not render without a full page reload.
- Fix the file input's `onChange` handler so it correctly handles re-selection after a cancelled pick. Reset the input value on cancel if needed.

---

## NAVBAR

### [BUG] Search suggestion dropdown does not close on outside click
- When the search suggestion window appears, clicking anywhere outside of it does not dismiss it.
- Add a click-outside event listener (or use a `useRef` + `useEffect` pattern) to close the suggestion dropdown when the user clicks outside the component.

### [BUG] Navbar disappears unexpectedly on scroll
- The navbar hides when the user scrolls to the bottom of the page.
- It also disappears when the user has scrolled to the very top and there is no more scroll room (overscroll/bounce).
- Review the scroll-direction detection logic. Add a threshold (e.g. only hide after scrolling down more than 80px) and treat position ≤ 0 (overscroll) as "at top" — always show navbar in that case.

### [IMPROVEMENT] Search bar functionality and algorithm
- The search bar is the most important UI element in the app. It must support keyword-based search, e.g. `bil`, `tesla`, `bmw`, `audi a4 2014`.
- Verify the search algorithm handles partial matches and is case-insensitive.
- Make sure results are relevant and ranked sensibly (e.g. title match > description match).

### [IMPROVEMENT] Remove category suggestions navbar (evaluate)
- The secondary category suggestions navbar may be adding clutter. The goal is direct keyword search without needing category pre-filtering.
- Remove the category suggestion bar and ensure keyword search alone produces relevant, complete results.

---

## PRODUCT CARD (Carousel)

### [BUG] Image carousel arrow buttons stop appearing after first click
- Clicking the right arrow once to view the next image works, but after that the left and right arrow buttons no longer appear on hover.
- The user is stuck on the second image with no way to navigate further.
- Debug the carousel component's hover/state logic. The buttons are likely being conditionally rendered based on state that isn't resetting correctly after the first interaction.

---

## PRODUCT PAGE

### [IMPROVEMENT] Breadcrumbs
- Add proper breadcrumb navigation to the product page so users can see and navigate their path (e.g. Home > Category > Product Name).

### [IMPROVEMENT] "Nøkkelinfo" (Key Info) section — evaluate usefulness
- The key info section on the product page was intended to give users a quick summary of the listing.
- Evaluate whether this section adds value or creates clutter. If kept, ensure it is populated correctly from the annonce creation form. If removed, clean up the related fields from the creation form and database schema.

---

## PROFILE & SETTINGS

### [BUG] Duplicate naming — "Profile" inside "Profile"
- The navigation has a "Profile" section with a sub-page also called "Profile", which is confusing.
- Rename and restructure the sections. Suggested structure:
  - **Account** or **Settings** — edit name, email, password, profile photo
  - **Profile** — public-facing user profile view
  - **My Annonces** — user's listings
  - **Favorites** — saved listings
  - **Messages** — chat inbox

### [IMPROVEMENT] Profile section overall design
- Redesign the profile/settings area to have a clean, clearly separated layout.
- Users should be able to see a summary of their activity in the app (listings created, favorites, etc.).
- The user avatar/icon in the navbar and its dropdown interaction should also be improved to feel polished.

---

## CREATE ANNONCE

### [IMPROVEMENT] Product categories
- Current categories are insufficient or poorly structured.
- Enrich the category list to cover common secondhand goods (electronics, vehicles, clothing, furniture, sports, etc.).
- Ensure categories are sensible and consistent with Norwegian marketplace conventions (similar to Finn.no).

### [IMPROVEMENT] Status field: Nytt / Brukt (New / Used)
- This field exists but its usefulness is unclear. Evaluate whether it should be kept, made more prominent, or removed. If kept, make sure it is displayed clearly on the product page.

### [IMPROVEMENT] Image upload and preview in create annonce
- Verify that image selection, preview rendering, reordering, and deletion work correctly throughout the annonce creation flow.
- Confirm that no broken states occur if a user adds, removes, or reorders images before submitting.

### [IMPROVEMENT] "Nøkkelinfo" (Key Info) creation section
- Ensure adding, editing, and rendering key info fields in the creation form works correctly and the data is saved and displayed properly on the product page.

### [BUG / REVIEW] Annonce ID assignment
- Confirm that annonce IDs are being generated correctly and consistently.
- Check for any edge cases where duplicate IDs or missing IDs could cause issues.

---

## FAVORITES

### [BUG] Users can favorite their own listings
- A user should not be able to add their own annonce to their favorites.
- Add a backend check (and a frontend UI check) to prevent this. If the current user's ID matches the annonce owner's ID, hide or disable the favorite button.

---

## MY ANNONCES

### [BUG] Crash when navigating to view annonces
- Error: `undefined is not an object (evaluating 'item.annonceImages[0]')`
- This crash occurs when the `annonceImages` field is missing or undefined on one or more annonce objects.
- Add a null/undefined guard wherever `annonceImages[0]` is accessed: e.g. `item.annonceImages?.[0]`. Also investigate why some annonces are missing this field (could be a schema or seeding issue).

---

## CHAT

### [BUG] Wrong profile photo shown in chat
- The other person's profile photo is not rendering correctly during a conversation.
- Verify the chat message model correctly references the sender's user ID and that the frontend resolves the correct user's photo per message.

### [BUG] "Active now" bubble always showing
- The online/active status indicator is always displayed as active regardless of actual user state.
- Either implement real presence detection or remove the "active now" indicator entirely until it can be done properly.

### [IMPROVEMENT] Chat UI redesign
- The current chat UI feels disconnected from the rest of the app's visual language and is messy.
- Replace the current chat library with a simpler custom-built or lighter React chat component that matches the app's design system.
- The UI should feel clean and minimal — focus on: message bubbles, sender avatar, timestamp, and basic input area.

---

## APPLICATION-LEVEL IMPROVEMENTS

### [IMPROVEMENT] Pagination / lazy loading
- The home page, search results, and profile sub-pages currently load all annonces at once.
- Chat loads all messages at once.
- Implement pagination or infinite scroll for annonce lists and chat messages to avoid performance issues at scale.

### [IMPROVEMENT] Image compression on upload
- Profile photos and product images are being uploaded at full resolution.
- Compress images before upload (client-side using a library like `browser-image-compression`) or on the server before storing.
- This reduces storage costs, improves load times, and prevents oversized images from looking visually inconsistent in the UI.

### [IMPROVEMENT] Replace current toast/feedback system with `react-hot-toast`
- Add user feedback (toast notifications) for all key actions:
  - Login / logout / register
  - Profile photo update, username update
  - Creating a new annonce
  - Adding / removing a favorite
  - Sending a message
  - Errors and unauthorized actions
- Use `react-hot-toast` consistently throughout the app.

### [IMPROVEMENT] Logout — clear all stored state
- Verify that logging out clears all cached data: JWT token, user state in React context/store, localStorage, and sessionStorage.
- No user data should persist after logout.

### [FEATURE] Delete account
- Allow users to permanently delete their account.
- On deletion, handle cascading cleanup: remove their annonces, remove them from other users' chat threads, remove their favorites references.
- Show a confirmation dialog before deletion.

### [IMPROVEMENT] Behavior when a user account is deleted by admin or self
- Define and implement what happens to that user's data: annonces, chat messages, favorites.
- Decide on a strategy: hard delete vs. soft delete with anonymization (e.g. "Deleted User").

### [FEATURE] Dark mode support
- Add dark mode using CSS variables or a theming solution (e.g. Tailwind dark mode classes).
- Respect the user's OS-level preference (`prefers-color-scheme`) as the default, with a manual toggle in settings.

---

## DESIGN — GLOBAL REDESIGN

### [IMPROVEMENT] Overall visual language
- The app needs a cohesive redesign pass across: Login/Register, Product Page, Profile sections, Navbar, and Footer.
- The current green accent color is too muted. Update it to a more vibrant, energetic shade that still works for a marketplace context.
- Replace placeholder or low-quality icons throughout the app, particularly for: "Ny annonse", "Meldinger", "Mine annonser". Use a consistent icon library (e.g. Lucide or Heroicons).

---

## DEVELOPMENT / INFRASTRUCTURE

### [TASK] Separate development and production environments
- Ensure backend and database configs are split by environment (`.env.development` vs `.env.production`).
- The app should never connect to the production database during local development.

### [TASK] 2FA email verification workaround for demo/testing
- Currently, email verification cannot be completed with fake/test email addresses, requiring manual DB edits.
- For the development environment, either: disable email verification entirely, or add a dev-mode bypass (e.g. a fixed OTP code like `000000` in dev).
- Do not change production verification behavior.

### [TASK] AWS root account usage
- The app is currently using an AWS root account for access.
- Create an IAM user with only the required permissions and rotate credentials. Stop using the root account for any application-level access.
