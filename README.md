# Rego

A full-stack secondhand marketplace built with the MERN stack. Users can list items for sale, browse listings, search by category and location, save favorites, and communicate with sellers through real-time chat.

**Live:** [rego.jakobg.tech](https://rego.jakobg.tech)

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router v6, Bootstrap 5, Socket.io Client

**Backend:** Node.js, Express, Passport.js (session auth), MongoDB/Mongoose, Socket.io, AWS S3

**Infrastructure:** Vercel (frontend), Railway (backend), MongoDB Atlas, Amazon S3

## Features

- **Listings** — Create, edit, and delete product listings with multiple image uploads (S3)
- **Search** — Full-text search with live suggestions, filter by category, county, and municipality
- **Real-time Chat** — Socket.io-powered messaging between buyers and sellers
- **Favorites** — Save and manage favorite listings
- **User Profiles** — Profile pictures, account management, email verification
- **Norwegian Geo Data** — Integrated with Geonorge API for county/municipality lookup

## Project Structure

```
rego/
├── client/          # React frontend (Vercel)
│   ├── src/
│   │   ├── Component/    # Shared components (Navbar, Footer, ProductCard)
│   │   ├── Pages/        # Route-level pages
│   │   ├── features/     # Redux slices and actions
│   │   └── config/       # API, socket, and store configuration
│   └── public/
├── server/          # Express backend (Railway)
│   ├── models/      # Mongoose schemas
│   ├── config/      # Database connection
│   └── *.js         # Route handlers
└── package.json     # Root scripts
```

## Local Development

```bash
# Install dependencies
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB, AWS, and email credentials

# Run both client and server
npm run dev
```

Frontend runs on `localhost:3000`, API on `localhost:3080`.

## Author

**Jakob Gøkpinar** — [jakobg.tech](https://jakobg.tech)
