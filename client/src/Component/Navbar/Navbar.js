import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import Searchbar from "./Searchbar";
import { logoutRequest } from "../../features/userSliceActions";
import { instanceAxs } from "../../config/api.js";
import socket from "../../config/socket";

const Navigation = () => {
  const [currentY, setCurrentY] = useState(0);
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
    const handleScroll = () => {
      setIsRender(window.scrollY <= currentY);
      setCurrentY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const logout = () => {
    navigate('/');
    dispatch(logoutRequest());
  };

  return (
    <div>
      {isRender &&
        <Navbar expand="lg" fixed="top" className="navigation" bg="light">
          <Container>
            <Navbar.Brand href="/">Rego</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" style={{ margin: 10 }}>
              <Searchbar />
              {isLoggedIn ? (
                <Nav className="navbar-nav">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt=""
                      className="navbar-avatar-img"
                    />
                  ) : (
                    <div className="navbar-avatar-placeholder">
                      <i className="fa-solid fa-user" />
                    </div>
                  )}
                  <DropdownButton
                    id="dropdown-basic-button"
                    title={user.username || user.email || ''}
                    variant="light"
                  >
                    <Dropdown.Item href="min-konto">Min Konto</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="/nyannonse">
                      <i className="fa-solid fa-plus me-2" /> Ny Annonse
                    </Dropdown.Item>
                    <Dropdown.Item href="/profil">
                      <i className="fa-regular fa-user me-2" /> Min Profil
                    </Dropdown.Item>
                    <Dropdown.Item href="/chat">
                      <i className="fa-regular fa-message me-2" />
                      {isUnreadMsg ? (
                        <span>Meldinger <span className="navbar-unread-dot" /></span>
                      ) : 'Meldinger'}
                    </Dropdown.Item>
                    <Dropdown.Item href="/mine-annonser">
                      <i className="fa-solid fa-scroll me-2" /> Mine Annonser
                    </Dropdown.Item>
                    <Dropdown.Item href="/favoritter">
                      <i className="fa-regular fa-heart me-2" /> Favoritter
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>
                      <i className="fa-solid fa-arrow-right-from-bracket me-2" /> Logg Ut
                    </Dropdown.Item>
                  </DropdownButton>
                </Nav>
              ) : (
                <Nav className="flex-grow-1 justify-content-end">
                  <Nav.Link href="/login" className="log-in-button">Logg Inn</Nav.Link>
                  <Nav.Link href="/register">Register</Nav.Link>
                </Nav>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>
      }
    </div>
  );
};

export default Navigation;