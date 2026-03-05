import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import styles from "./Navbar.module.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';

import Searchbar from "./Searchbar";
import { logoutRequest } from "../../store/authThunks";

const Navigation = () => {
  const lastScrollY = useRef<number>(0);
  const [isRender, setIsRender] = useState<boolean>(true);

  const isLoggedIn = useAppSelector(state => state.user.isLoggedIn);
  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const SCROLL_THRESHOLD = 80;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= 0) {
        setIsRender(true);
        lastScrollY.current = 0;
        return;
      }
      const atBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 10);
      if (atBottom) {
        setIsRender(true);
        lastScrollY.current = y;
        return;
      }
      const delta = y - lastScrollY.current;
      if (delta > SCROLL_THRESHOLD) {
        setIsRender(false);
        lastScrollY.current = y;
      } else if (delta < -SCROLL_THRESHOLD) {
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
      <Navbar expand="lg" fixed="top" className={styles['navigation'] + (isRender ? '' : ` ${styles['navbar-hidden']}`)}>
        <Container>
          <Navbar.Brand href="/">Rego</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className={styles['navbar-center']}>
              <Searchbar />
            </div>
            {isLoggedIn ? (
              <Nav className={styles['navbar-actions']}>
                <Nav.Link href="/nyannonse" className={styles['navbar-new-listing']}>
                  <i className="fa-solid fa-plus me-1" />
                  <span className="navbar-new-listing-text">Ny Annonse</span>
                </Nav.Link>
                <Nav.Link href="/chat" className={styles['navbar-icon-link']}>
                  <i className="fa-regular fa-message" />
                </Nav.Link>
                <Nav.Link href="/favoritter" className={styles['navbar-icon-link']}>
                  <i className="fa-regular fa-heart" />
                </Nav.Link>
                <Dropdown align="end" className={styles['navbar-user-dropdown']}>
                  <Dropdown.Toggle variant="light" className={styles['navbar-user-toggle']}>
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" className={styles['navbar-avatar-img']} />
                    ) : (
                      <div className={styles['navbar-avatar-placeholder']}>
                        <i className="fa-solid fa-user" />
                      </div>
                    )}
                    <span className={styles['navbar-username']}>{user.name || ''}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className={styles['navbar-dropdown-menu']}>
                    <div className={styles['navbar-dropdown-header']}>
                      <span className={styles['navbar-dropdown-name']}>{user.username || ''}</span>
                      <span className={styles['navbar-dropdown-email']}>{user.email}</span>
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
                    <Dropdown.Item as="button" onClick={logout} className={styles['navbar-logout-item']}>
                      <i className="fa-solid fa-arrow-right-from-bracket me-2" /> Logg Ut
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            ) : (
              <Nav className={styles['navbar-actions']}>
                <Nav.Link href="/login" className={styles['navbar-login-link']}>Logg Inn</Nav.Link>
                <Nav.Link href="/register" className={styles['navbar-register-link']}>Registrer</Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navigation;
