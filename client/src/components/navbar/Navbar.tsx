import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import styles from "./Navbar.module.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Searchbar from "./Searchbar";
import Icon from "../icons/Icon";
import { logoutRequest } from "../../store/authThunks";
import { useTheme } from "../../hooks/useTheme";
import { getChatRoomsApi } from "../../services/chatService";
import { queryKeys } from "../../lib/queryKeys";
import socket from "../../lib/socket";

const CATEGORIES = [
  { label: 'Elektronikk',     icon: 'laptop',   slug: 'Elektronikk' },
  { label: 'Møbler',          icon: 'couch',    slug: 'Møbler og interiør' },
  { label: 'Klær og mote',    icon: 'shirt',    slug: 'Klær og mote' },
  { label: 'Sport',           icon: 'bicycle',  slug: 'Sport og friluftsliv' },
  { label: 'Bil og kjøretøy', icon: 'car',      slug: 'Bil og kjøretøy' },
  { label: 'Hage',            icon: 'seedling', slug: 'Hage og utemiljø' },
  { label: 'Barneartikler',   icon: 'baby',     slug: 'Barneartikler' },
  { label: 'Hobby og fritid', icon: 'palette',  slug: 'Hobby og fritid' },
];

const Navigation = () => {
  const lastScrollY = useRef<number>(0);
  const [isRender, setIsRender] = useState<boolean>(true);

  const isLoggedIn = useAppSelector(state => state.user.isLoggedIn);
  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  // Refetch chat rooms instantly when a message arrives via socket
  useEffect(() => {
    if (!isLoggedIn || !user?._id) return;
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms(user._id) });
    };
    socket.on('getMessage', handler);
    return () => { socket.off('getMessage', handler); };
  }, [isLoggedIn, user?._id, queryClient]);

  const { data: chatRooms = [] } = useQuery({
    queryKey: queryKeys.chat.rooms(user?._id ?? ''),
    queryFn: getChatRoomsApi,
    enabled: isLoggedIn && !!user?._id,
    refetchInterval: 30_000,
  });

  const hasUnread = chatRooms.some(room => {
    if (!user?._id) return false;
    const isBuyer = room.buyer === user._id;
    return isBuyer ? room.unreadBuyer > 0 : room.unreadSeller > 0;
  });

  useEffect(() => {
    const SCROLL_THRESHOLD = 80;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= 0) { setIsRender(true); lastScrollY.current = 0; return; }
      const delta = y - lastScrollY.current;
      if (delta > SCROLL_THRESHOLD) { setIsRender(false); lastScrollY.current = y; }
      else if (delta < -SCROLL_THRESHOLD) { setIsRender(true); lastScrollY.current = y; }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    navigate('/');
    dispatch(logoutRequest());
  };

  return (
    <Navbar expand="lg" fixed="top" className={styles['navigation'] + (isRender ? '' : ` ${styles['navbar-hidden']}`)}>
      <Container>
        <Navbar.Brand href="/">
          <div className={styles['navbar-brand-mark']}>
            <div className={styles['navbar-brand-icon']}>
              <Icon name="tag" />
            </div>
            <span>Rego</span>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          <Nav className={styles['navbar-left']}>
            <Dropdown className={styles['navbar-categories']}>
              <Dropdown.Toggle as="button" className={styles['navbar-categories-toggle']}>
                Kategorier
              </Dropdown.Toggle>
              <Dropdown.Menu className={styles['navbar-categories-menu']} popperConfig={{ strategy: 'fixed' }}>
                {CATEGORIES.map(cat => (
                  <Dropdown.Item key={cat.slug} href={`/search?category=${encodeURIComponent(cat.slug)}`} className={styles['navbar-categories-item']}>
                    <Icon name={cat.icon} />
                    {cat.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>

          <div className={styles['navbar-center']}>
            <Searchbar />
          </div>

          {isLoggedIn ? (
            <Nav className={styles['navbar-actions']}>
              <Nav.Link href="/new-listing" className={styles['navbar-new-listing']}>
                <Icon name="plus" style={{ marginRight: 4 }} />
                <span>Ny Annonse</span>
              </Nav.Link>
              <Nav.Link href="/chat" className={styles['navbar-icon-link']}>
                <Icon name="message-outline" />
                {hasUnread && <span className={styles['navbar-unread-dot']} />}
                <span className={styles['navbar-icon-label']}>Meldinger</span>
              </Nav.Link>
              <Nav.Link href="/favorites" className={styles['navbar-icon-link']}>
                <Icon name="heart-outline" />
                <span className={styles['navbar-icon-label']}>Favoritter</span>
              </Nav.Link>
              <button onClick={toggleTheme} className={styles['navbar-theme-toggle']} aria-label="Bytt tema">
                <Icon name={theme === 'light' ? 'moon' : 'sun'} />
              </button>
              <Dropdown align="end" className={styles['navbar-user-dropdown']}>
                <Dropdown.Toggle variant="light" className={styles['navbar-user-toggle']}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className={styles['navbar-avatar-img']} />
                  ) : (
                    <div className={styles['navbar-avatar-placeholder']}>
                      <Icon name="user" />
                    </div>
                  )}
                  <span className={styles['navbar-username']}>{user?.fullName || ''}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className={styles['navbar-dropdown-menu']}>
                  <div className={styles['navbar-dropdown-header']}>
                    <span className={styles['navbar-dropdown-name']}>{user?.fullName || ''}</span>
                    <span className={styles['navbar-dropdown-email']}>{user?.email}</span>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item href="/account">
                    <Icon name="user-outline" style={{ marginRight: 8 }} /> Min Konto
                  </Dropdown.Item>
                  <Dropdown.Item href="/my-listings">
                    <Icon name="scroll" style={{ marginRight: 8 }} /> Mine Annonser
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" onClick={logout} className={styles['navbar-logout-item']}>
                    <Icon name="arrow-right-from-bracket" style={{ marginRight: 8 }} /> Logg Ut
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          ) : (
            <Nav className={styles['navbar-actions']}>
              <button onClick={toggleTheme} className={styles['navbar-theme-toggle']} aria-label="Bytt tema">
                <Icon name={theme === 'light' ? 'moon' : 'sun'} />
              </button>
              <Nav.Link href="/login" className={styles['navbar-login-link']}>Logg Inn</Nav.Link>
              <Nav.Link href="/register" className={styles['navbar-register-link']}>Registrer</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
