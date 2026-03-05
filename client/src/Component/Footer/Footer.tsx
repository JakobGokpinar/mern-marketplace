import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom"
import styles from './Footer.module.css';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';

const Footer = () => {
  const [isRender, setIsRender] = useState(true)
  const location = useLocation();

  useEffect(() => {
    if(location.pathname === '/nyannonse') {
      setIsRender(false)
    } else {
      setIsRender(true)
    }
  },[location.pathname])

  return (
    <div className={styles['footer-container']}>
      {isRender &&
              <div className={styles['footer-div']}>
                  <Row className={styles['footer-row']}>
                      <Col className={styles['footer-col']} lg={4} md={4} sm={12}>
                          <div className={`${styles['footer-content']} ${styles['footer-brand']}`}>
                              <span className={styles['footer-logo-text']}>Rego</span>
                              <p className={styles['footer-tagline']}>Kjøp og selg lokalt</p>
                          </div>
                      </Col>
                      <Col className={styles['footer-col']} lg={4} md={4} sm={12}>
                          <div className={styles['footer-content']}>
                              <p className={styles['footer-heading']}>Lenker</p>
                              <a href='/privacy-policy'>Personvern</a>
                              <a href='/about-us'>Om Oss</a>
                          </div>
                      </Col>
                      <Col className={styles['footer-col']} lg={4} md={4} sm={12}>
                        <div className={styles['footer-content']}>
                                  <p className={styles['footer-heading']}>Min Konto</p>
                                  <a href='/profil'>Min Profil</a>
                                  <a href='/nyannonse'>Ny Annonse</a>
                                  <a href='/chat'>Meldinger</a>
                                  <a href='/mine-annonser'>Mine Annonser</a>
                                  <a href='/favoritter'>Favoritter</a>
                            </div>
                      </Col>
                  </Row>
                  <Row className={`${styles['footer-row']} ${styles['footer-bottom']}`}>
                      <div className={styles['footer-lower']}>
                        <p style={{margin: 0}}>
                          &copy; {new Date().getFullYear()} Jakob Gokpinar
                        </p>
                      </div>
                  </Row>
            </div>
      }
    </div>
  )
}

export default Footer;
