Login/Register
    -register successfully works
        - should we update the values for registering ?
    -login successsfully works

Profile
    -User profile picture update (err: 'You have to login to upload files', even though the user is logged in) (done)
    -User choose a new profile photo -> Avbryt -> Choose a new one -> UI doesn't render to show the photo preview, requiring a reload (done)

Navbar
    -works okay as a portfolio based project, it is nothing of fancy. However, the design of the searchbar can be better, it is the ultimate tool
    to search products across the application. We have to make sure our searching algorithm works well. We might also remove the category suggestions navbar.
    Reason being, is to make the searching more stragihtforward and easy, allowing users to search directly with just keywords. The results we show them
    is the real deal. I should be able to just search "bil", "tesla", "bmw", "mercesdes", "audi a4 2014" etc. for each relevant topic.
    -design of the navbar could be better. when suggestion window pops up, it doesn't disappear when i click anywhere on the screen, outside of that
    suggestion window. (done)
    -Nabar is very sensitive. It goes away when scrolled to the bottom of the page, and when user pulls up the screen by scrolling all the way to the top
    of the page, and there is no more room to scroll, then navbar also disappears. (done)
    -We want navbar to simple but powerful, avoiding clutter while enabling efficeny. (done)
    -I know this navbar topic is a complex one. there is no one-size-fits-all answer, and there are many designs, approaches of navbars out there. That's
    why i struggled to describe what i really want from the navbar of our project, but we can take smaller steps to make it professional (done)

Product Card
    -I can click the righ-arrow once, to review the next image however after that the right and left buttons
    don't appear when I hover the mouse again. so, we are stuck at the 2. image of the product in the carusoal. neither can go forward or back 
    to other images. (done)

Product Page
    -Overall good design with seller and product's contents. just a small improvment would be the breadcrumbs, and the "nøkkelinfø" (key info) section, 
    i thought this section would be cool to have to give the user a quick overall overview of the product. i'm not sure if it is doing it job, or if users
    will use it properly, or it will just be a clutter. I don't know. This is also an issue related to announce creation, since it is where we assing it. (done)
    -the product images getting changed in the carousal looks cool. 

Profile
    - Naming is bad, we have Profile and another Profile under that. 
    - I was thinking it of as a settings page and a user profile details page when designing where you can see your name, lastname, 
    edit/view profile photo. 
    - We might make all these more professional, have a clean separated design (Profile, settings, annonces, favorites etc)
    - Imagine it somewhere like, most websites have: a place wher user can see and track the actions he took in the app. 
    - We can make design improvments both in Profile, Profile/Profile, and how the user icon is placed on the navbar and how it is getting interacted
    with (done)

CreateAnnonce (not need changes here for now)
    - product categories. enrich them and make them sensible. 
    - Is image editing, rendering, and displaying good in create new annonce. 
    - Status nytt/brukt: a similar feature taken from Finn.no, don't know how useful is it
    - Overall design of the page, I want to give users's a smooth and comfortable page to create their product annonces. 
    - Again the ("Key info") creation section, adding, editing and rendering.
    - Does giving id's to annonces to work perfectly, any issues there, is it convenient ?

Favorites
    - User are being to able to favorite their own annonces (done-fixed)

MyAnnonces (done)
    - Annonce update works (price, name etc)
    - Got an error: ERROR undefined is not an object (evaluating 'item.annonceImages[0]') @http://localhost:3000/static/js/bundle.js:6657:36 map@[native code]
    when trying to navigate and view annonces

Chat
    - Chatting part is tricky: both the frontend design and backend logic
    - current ui design is not very good. 
    - we are using another library, change it some other react-library or build our own simple chat version
    - ui feels messy and not relatable with rest of the app. 
    - some errors: rendering other person's photo while chatting, constant active now bubble etc.


# DESIGN - remake (done)
    - Overall design of the Login/Register, product page, Profile sections
    - Navbar and Footer. 
    - using better icons (eg "ny annonse", "meldinger", "mine annonser")



# OTHER - minor/major improvement points:
    Application-level:
    -loading every annonce at once (home page, search result page, and under Profile sections), and loading every chat message at once. Might 
    be a heavy call when there is lots of annonces in the future
    -User profile page and Each of the sub-pages can be more beautfil (profile, Favorites, messages, my announces, create annonce)
    -Is logging out functionality, works perfectly ? clearing caches and other stored info
    -Have a good,response UI/UX through out the app
    -Have good structured/layered arhictecture of the frontend and backend, and make sure the integration between them are smoothless and secure
    -Image upload: Product image upload, and profile photo upload. We are uploading the files at full resolution. would it cause harm for storage,
    load, slowness in the app and in the database in the long term. Do we need to highest quailty images in our app ? Because the high quaility 
    images also look "weird" in the app, like they are not setting up perfectly with their background, especially the lighter ones. 
    - feedback component, switch to react-hot-toast (give feedback in crutial parts in the app eg. logging ing, registering, adding a product to favorites, 
    updaing profile photo or username, creating a new annonce, when user tries to do illegal thing, when user accomplishes a task etc)
    - what happens when a user account is deleted (chats, etc)
    - possibility for adding "delete account" feature
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