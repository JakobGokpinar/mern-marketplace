# Rego — Project Structure

```
mern-marketplace/
├── package.json                  # Root scripts (dev, install:all)
├── .gitignore
├── README.md
├── TODO.md                       # Project tracker
├── STRUCTURE.md                  # This file
│
├── client/                       # React frontend (Vercel)
│   ├── package.json
│   ├── vercel.json               # SPA routing config
│   ├── .env.example
│   ├── .env                      # Local env vars (gitignored)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js              # Entry point (ReactDOM.render)
│       ├── App.js                # Router + route definitions
│       ├── App.css
│       ├── design.css            # Global design system (teal palette, CSS vars)
│       ├── FeedbackBanner.js     # Global toast notifications (Bootstrap Alert)
│       ├── FeedbackBanner.css
│       ├── categories.json       # Product category definitions
│       │
│       ├── config/
│       │   ├── api.js            # Axios instance (env-based URL)
│       │   ├── socket.js         # Socket.io client (env-based URL)
│       │   └── store-config.js   # Redux store setup
│       │
│       ├── features/
│       │   ├── userSlice.js          # User state (login, logout, setUser)
│       │   ├── userSliceActions.js   # Async thunks (login, signup, favorites, etc.)
│       │   ├── uiSlice.js            # UI state (feedback banner)
│       │   ├── appDataSlice.js       # App data (districts, communes)
│       │   └── appDataSliceActions.js # Fetch Norway geo data
│       │
│       ├── utils/
│       │   ├── cropImage.js
│       │   └── dataURltoFile.js
│       │
│       ├── Component/
│       │   ├── Navbar/
│       │   │   ├── Navbar.js         # Main nav with auth state, unread messages
│       │   │   ├── Navbar.css
│       │   │   ├── Searchbar.js      # Live search with suggestions
│       │   │   └── Searchbar.css
│       │   ├── Footer/
│       │   │   ├── Footer.js
│       │   │   └── Footer.css
│       │   ├── ProductCard/
│       │   │   ├── ProductCard.js    # Listing card (favorites, share, formatted prices)
│       │   │   └── ProductCard.css
│       │   └── FilterSearch/
│       │       └── FilterBox.js
│       │
│       └── Pages/
│           ├── HomePage/
│           │   ├── Menu.js           # Main feed — CSS Grid product listing
│           │   └── Menu.css
│           ├── LoginAndRegister/
│           │   ├── Login.js
│           │   ├── Login.css
│           │   ├── Register.js
│           │   └── Register.css
│           ├── Chat/
│           │   ├── Chat.js           # Chat page (~200 lines, 12+ useEffects)
│           │   ├── Chat.css
│           │   └── ChatParts/
│           │       ├── Conversations.js  # Chat list with CSS avatar placeholders
│           │       ├── Conversation.css
│           │       └── Messages.js
│           ├── EmailVerification/
│           │   ├── EmailVerify.js
│           │   └── EmailVerify.css
│           ├── NewAnnonce/
│           │   ├── NewAnnonce.js      # Create listing (~400 lines, CSS backdrop)
│           │   └── NewAnnonce.css
│           ├── ProductPage/
│           │   ├── ProductPage.js     # Single product view (seller card, info cards)
│           │   └── ProductPage.css
│           ├── Profile/
│           │   ├── Profile.js         # Account hub (links to sub-pages)
│           │   ├── Profile.css
│           │   ├── Profile/
│           │   │   ├── Profile.js     # Edit profile page
│           │   │   └── Profile.css
│           │   ├── Favorites/
│           │   │   ├── Favorites.js
│           │   │   └── Favorites.css
│           │   └── MyAnnonces/
│           │       ├── MyAnnonces.js
│           │       └── MyAnnonces.css
│           ├── SearchedResultPage/
│           │   ├── SearchResult.js
│           │   ├── SearchResult.css
│           │   ├── Filters.js        # Filter sidebar (Bootstrap only)
│           │   ├── Filters.css
│           │   ├── FilterBadge.js    # Active filter badges (Bootstrap styled)
│           │   ├── FilterBadge.css
│           │   └── FilterComponents/
│           │       └── Header.js
│           ├── PrivacyAndAbout/
│           │   ├── PrivacyPolicy.js
│           │   ├── AboutUs.js
│           │   └── Policies.css
│           ├── NotFound.js
│           └── NotFound.css
│
└── server/                       # Express backend (Railway)
    ├── package.json
    ├── .npmrc                    # legacy-peer-deps for mongodb conflict
    ├── .env.example
    ├── .env                      # Production env vars (gitignored)
    ├── railway.toml              # Railway deploy config
    ├── server.js                 # Entry point (Express + Socket.io)
    ├── auth.js                   # Auth routes (login, signup, Google OAuth)
    ├── chat.js                   # Chat routes + message handling
    ├── createAnnonce.js          # Create/delete listings (S3 upload)
    ├── search.js                 # Browse/filter listings
    ├── searchProduct.js          # Live search suggestions
    ├── findProduct.js            # Single product lookup
    ├── fetchUser.js              # Fetch authenticated user data
    ├── addfavorites.js           # Add/remove favorites
    ├── profileSettings.js        # Profile update, picture upload
    ├── emailRoute.js             # Email verification route
    ├── sendEmail.js              # Nodemailer email sender
    ├── config/
    │   └── db.js                 # MongoDB connection
    └── models/
        ├── UserModel.js          # User schema
        ├── GoogleUserModel.js    # Google OAuth user schema
        ├── AnnonceModel.js       # Product listing schema
        ├── ChatRoomModel.js      # Chat room schema
        └── MessageModel.js       # Chat message schema
```
