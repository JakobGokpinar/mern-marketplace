import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import './App.css';

import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerify from './pages/email-verify/EmailVerify';
import NotFound from './pages/not-found/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

import { userActions } from './store/userSlice';
import { logoutRequest } from './store/authThunks';
import { onUnauthorized } from './lib/authEvents';
import toast from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import type { User } from './types/user';

const Menu = React.lazy(() => import('./pages/home/Menu'));
const ProductPage = React.lazy(() => import('./pages/listing/ProductPage'));
const Chat = React.lazy(() => import('./pages/chat/Chat'));
const SearchResult = React.lazy(() => import('./pages/search/SearchResult'));
const NewListing = React.lazy(() => import('./pages/new-listing/NewAnnonce'));
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
              <Route path='/' element={<Menu />} />
              <Route path='/search' element={<SearchResult />} />
              <Route path='/listing/:id' element={<ProductPage />} />
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
      <Toaster position="bottom-center" toastOptions={{ duration: 5000 }} />
    </>
  );
};

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
};

export default App;
