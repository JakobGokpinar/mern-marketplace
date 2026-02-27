# Rego — Secondhand Marketplace

## Stack
MERN (MongoDB, Express, React 17, Node.js). CRA frontend, no TypeScript.

## Architecture
- client/ → React frontend, deployed on Vercel (rego.jakobg.tech)
- server/ → Express backend, deployed on Railway
- MongoDB Atlas for database

## Design System
- All styles use CSS variables defined in client/src/design.css
- Primary: #0D9488 (teal). See design.css for full palette.
- Bootstrap 5 + custom CSS. NO MUI (fully removed).
- System font stack, no external fonts.
- Norwegian language UI — don't translate existing text.

## Rules
- Never add new npm dependencies without asking
- Never touch working features when fixing styling
- Use REACT_APP_API_URL env var for API URLs
- Follow existing CSS-per-component pattern (ComponentName.css)
- No inline styles unless absolutely necessary
- Keep console.log out of committed code