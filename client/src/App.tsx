import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import './App.css';

import { Toaster } from 'react-hot-toast';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerify from './pages/email-verify/EmailVerify';
import NotFound from './pages/not-found/NotFound';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import ErrorBoundary from './components/error-boundary/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { userActions } from './store/userSlice';
import { logoutRequest } from './store/authThunks';
import { onUnauthorized } from './lib/authEvents';
import toast from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import { ThemeContext, useThemeProvider } from './hooks/useTheme';
import type { User } from './types/user';

const Home = React.lazy(() => import('./pages/home/Home'));
const ListingPage = React.lazy(() => import('./pages/listing/ListingPage'));
const Chat = React.lazy(() => import('./pages/chat/Chat'));
const SearchResult = React.lazy(() => import('./pages/search/SearchResult'));
const NewListing = React.lazy(() => import('./pages/new-listing/NewListing'));
const Account = React.lazy(() => import('./pages/account/Account'));
const Favorites = React.lazy(() => import('./pages/favorites/Favorites'));
const MyListings = React.lazy(() => import('./pages/my-listings/MyListings'));

const AppContent = () => {
  const dispatch = useAppDispatch();
  const user: User | null = JSON.parse(window.localStorage.getItem('user') ?? 'null') as User | null;

  useSocket();

  useEffect(() => {
    return onUnauthorized(() => {
      dispatch(userActions.logout());
      toast.error('Sesjonen din har utløpt. Logg inn på nytt.');
    });
  }, [dispatch]);

  useEffect(() => {
    const isLoggedIn: boolean | null = JSON.parse(window.localStorage.getItem('isLoggedIn') ?? 'null');
    const expiry: number | null = JSON.parse(window.localStorage.getItem('expiry') ?? 'null');
    const date = new Date();

    if (isLoggedIn === null || user === null) return;

    if (expiry !== null && date.getTime() > expiry) {
      dispatch(logoutRequest());
      return;
    }
    if (isLoggedIn && user) {
      dispatch(userActions.login(user));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <div className='app-div'>
        <div className='app-div__content'>
          <ErrorBoundary>
          <Suspense fallback={<div className="page-loading" />}>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
              <Route path='/' element={<Home />} />
              <Route path='/search' element={<SearchResult />} />
              <Route path='/l/:id' element={<ListingPage />} />
              <Route path='/emailverify' element={<EmailVerify />} />

              <Route path='/new-listing' element={<ProtectedRoute><NewListing /></ProtectedRoute>} />
              <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path='/favorites' element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path='/my-listings' element={<ProtectedRoute><MyListings /></ProtectedRoute>} />

              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
      <Toaster position="bottom-center" toastOptions={{ duration: 5000 }} containerStyle={{ bottom: 120 }} />
    </>
  );
};

const App = () => {
  const themeValue = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeValue}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
      <Analytics />
      <SpeedInsights />
    </ThemeContext.Provider>
  );
};

export default App;
