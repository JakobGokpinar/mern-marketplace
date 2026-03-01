import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';

import Searchbar from "./Searchbar";
import { logoutRequest } from "../../features/userSliceActions";
import { instanceAxs } from "../../config/api.js";
import socket from "../../config/socket";

const Navigation = () => {
  const lastScrollY = useRef(0);
  const [isRender, setIsRender] = useState(true);
  const [isUnreadMsg, setIsUnreadMsg] = useState(false);

  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Single function to check unread messages
  const checkUnreadMessages = useCallback(() => {
    if (!user?._id) return;
    instanceAxs.post('/chat/get/rooms', { user: user._id })
      .then(response => {
        const hasUnread = response.data.some(room => room.unreadMessages > 0);
        setIsUnreadMsg(hasUnread);
      })
      .catch(() => {});
  }, [user]);

  // Check on login/user change
  useEffect(() => {
    checkUnreadMessages();
  }, [checkUnreadMessages]);

  // Check when a new message arrives
  useEffect(() => {
    const handleNewMessage = () => checkUnreadMessages();
    socket.on('getMessage', handleNewMessage);
    return () => socket.off('getMessage', handleNewMessage);
  }, [checkUnreadMessages]);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const SCROLL_THRESHOLD = 80;
    const handleScroll = () => {
      const y = window.scrollY;
      // Always show navbar at the top (including overscroll/bounce)
      if (y <= 0) {
        setIsRender(true);
        lastScrollY.current = 0;
        return;
      }
      // Always show navbar at the bottom of the page
      const atBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 10);
      if (atBottom) {
        setIsRender(true);
        lastScrollY.current = y;
        return;
      }
      const delta = y - lastScrollY.current;
      if (delta > SCROLL_THRESHOLD) {
        // Scrolled down past threshold — hide
        setIsRender(false);
        lastScrollY.current = y;
      } else if (delta < -SCROLL_THRESHOLD) {
        // Scrolled up past threshold — show
        setIsRender(true);
        lastScrollY.current = y;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    navigate('/');
    dispatch(logoutRequest());
  };

  return (
    <div>
        <Navbar expand="lg" fixed="top" className={`navigation${isRender ? '' : ' navbar-hidden'}`}>
          <Container>
            <Navbar.Brand href="/">Rego</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <div className="navbar-center">
                <Searchbar />
              </div>
              {isLoggedIn ? (
                <Nav className="navbar-actions">
                  <Nav.Link href="/nyannonse" className="navbar-new-listing">
                    <i className="fa-solid fa-plus me-1" />
                    <span className="navbar-new-listing-text">Ny Annonse</span>
                  </Nav.Link>
                  <Nav.Link href="/chat" className="navbar-icon-link">
                    <i className="fa-regular fa-message" />
                    {isUnreadMsg && <span className="navbar-unread-dot" />}
                  </Nav.Link>
                  <Nav.Link href="/favoritter" className="navbar-icon-link">
                    <i className="fa-regular fa-heart" />
                  </Nav.Link>
                  <Dropdown align="end" className="navbar-user-dropdown">
                    <Dropdown.Toggle variant="light" className="navbar-user-toggle">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="navbar-avatar-img" />
                      ) : (
                        <div className="navbar-avatar-placeholder">
                          <i className="fa-solid fa-user" />
                        </div>
                      )}
                      <span className="navbar-username">{user.name || ''}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="navbar-dropdown-menu">
                      <div className="navbar-dropdown-header">
                        <span className="navbar-dropdown-name">{user.username || ''}</span>
                        <span className="navbar-dropdown-email">{user.email}</span>
                      </div>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/min-konto">
                        <i className="fa-solid fa-house me-2" /> Min Konto
                      </Dropdown.Item>
                      <Dropdown.Item href="/profil">
                        <i className="fa-regular fa-user me-2" /> Min Profil
                      </Dropdown.Item>
                      <Dropdown.Item href="/mine-annonser">
                        <i className="fa-solid fa-scroll me-2" /> Mine Annonser
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={logout} className="navbar-logout-item">
                        <i className="fa-solid fa-arrow-right-from-bracket me-2" /> Logg Ut
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav>
              ) : (
                <Nav className="navbar-actions">
                  <Nav.Link href="/login" className="navbar-login-link">Logg Inn</Nav.Link>
                  <Nav.Link href="/register" className="navbar-register-link">Registrer</Nav.Link>
                </Nav>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>
    </div>
  );
};

export default Navigation;
