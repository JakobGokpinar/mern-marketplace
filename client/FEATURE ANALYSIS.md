
Profile
    - Naming is bad, we have Profile and another Profile under that. 
    - I was thinking it of as a settings page and a user profile details page when designing where you can see your name, lastname, 
    edit/view profile photo. 
    - Imagine it somewhere like, most websites have: a place wher user can see and track the actions he took in the app. 

CreateAnnonce (not need changes here for now)
    - product categories. enrich them and make them sensible. 
    - Is image editing, rendering, and displaying good in create new annonce. 
    - Status nytt/brukt: a similar feature taken from Finn.no, don't know how useful is it
    - Overall design of the page, I want to give users's a smooth and comfortable page to create their product annonces. 
    - Again the ("Key info") creation section, adding, editing and rendering.
    - Does giving id's to annonces to work perfectly, any issues there, is it convenient ?

Chat
    - Chatting part is tricky: both the frontend design and backend logic
    - current ui design is not very good. 
    - we are using another library, change it some other react-library or build our own simple chat version
    - ui feels messy and not relatable with rest of the app. 
    - some errors: rendering other person's photo while chatting, constant active now bubble etc.

I want you to make changes to client. 
When done
robust, compact code. 
better

# OTHER - minor/major improvement points:
    Application-level:
    -loading every annonce at once (home page, search result page, and under Profile sections), and loading every chat message at once. Might 
    be a heavy call when there is lots of annonces in the future
    -Is logging out functionality, works perfectly ? clearing caches and other stored info
    -Have a good,response UI/UX through out the app
    -Have good structured/layered arhictecture of the frontend and backend, and make sure the integration between them are smoothless and secure
    -Image upload: Product image upload, and profile photo upload. We are uploading the files at full resolution. would it cause harm for storage,
    load, slowness in the app and in the database in the long term. Do we need to highest quailty images in our app ? Because the high quaility 
    images also look "weird" in the app, like they are not setting up perfectly with their background, especially the lighter ones. 
    - feedback component, switch to react-hot-toast (give feedback in crutial parts in the app eg. logging ing, registering, adding a product to favorites, 
    updaing profile photo or username, creating a new annonce, when user tries to do illegal thing, when user accomplishes a task etc)
    - what happens when a user account is deleted (chats, etc), is "delete account" working properly?
    - adding dark mode support

    Development-principles level:
        -Sepearing development and production environment (backend and database)
        -we are signing in to AWS with root account (might need to change it)

        -when testing some features with new demo users: can't send 2fa emails to fake email accounts, therefore not able to verify the 
        demo account, therefore not able to create annonces with the demo user. Must go to database manually and change the "isEmailVerified" variable
        manually. Which is a workaround, shouldn't be done. This is actually relates to point above about production & development environements. 
        -Technology behind how user state gets saved across the application to be accessible, retrieve upon, and persisted on browser close
        -using recent versions and capabilites of both the language and frameworks. 


# WORKING FEATURES:
*User name update works
*marking and unmarking favorite annonces work

# SUMMARY
- overall a better and modern UI redesign


# REACT 

## STATE MANAGMENT (REDUX IS AN OPTION)

### HOW TO STORE, WHAT TO STORE

I want you to make changes to frontend code. 

Identify the compoenents and come with better solutions.
Redo components.
Improve state management. Address solutions to what to store and how to store it (prop drilling or redux are some options)
Improved component hierarchy 
Improved (function, function calls, react-idioms)

When the project is done, it should leave behind:
Complete, robust frontend code
that looks well organized on github, looks good on the website
that is easy to understand.
When someone wants to clone the repo and make his own changes, it should be easy to familirize himself and understand what's going on.
When I come back a few years later wanting to remove the dust, it should be familier, it should be easy to swap old dependencies with new ones and the app can stay running problem-free years on. 

Take time to think, plan, analyse.
Take time to think, plan, analyse to identify the problems and to come up with solutions
Find the most modern, up-to-date and best tech-stack to make this app achieve it. 
Take time to think, plan, analyse to make the app future-proof.


# BACKEND

## CLEAN CODE

### REDUNTANT CODE

### NAMING

#### FUNCTIONS, FILE NAMES, VARS, .ENV VARIABLES

What needs planning (not touched):
  - mongoose 5.x → upgrade to 8.x (many breaking changes, needs its own session)
  - aws-sdk v2 → migrate to @aws-sdk/client-s3 v3 (API is completely different)
  - Model collection names 'rooms' and 'email' need a DB migration to rename cleanly
  - passport ^0.4.1 in package.json should be bumped to ^0.6.0 to match the async req.logout(cb) API the code already uses

Update node

Things to consdier at all times
1-Naming
2-Robustness and latestness (use of latest and stable technology)
3-No or minimal redundancy

why are you not using the latest Vite?

from the start of this project years ago, i've always tried to copy big, modern applications like (Finn and ebay).
Due to resources and lack of experiences, i might have created spaghetti or reduntant code. Please feel free to fix these whever you see in the project


Rate your own work from a senior dev's perspective

