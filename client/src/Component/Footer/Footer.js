import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom"
import './Footer.css';
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
    <div className='footer-container'>
      {isRender && 
              <div className='footer-div'>
                  <Row className='footer-row'>
                      <Col className='footer-col' lg={4} md={4} sm={12}>
                          <div className='footer-content footer-brand'>
                              <span className='footer-logo-text'>Rego</span>
                              <p className='footer-tagline'>Letteste veien å handle</p>
                          </div>
                      </Col>
                      <Col className='footer-col' lg={4} md={4} sm={12}>
                          <div className='footer-content'>
                              <p className='footer-heading'>Lenker</p>
                              <a href='/privacy-policy'>Personvern</a>
                              <a href='/about-us'>Om Oss</a>
                          </div>
                      </Col>
                      <Col className='footer-col' lg={4} md={4} sm={12}>
                        <div className='footer-content'>
                                  <p className='footer-heading'>Min Konto</p>
                                  <a href='/profil'>Min Profil</a>
                                  <a href='/nyannonse'>Ny Annonse</a>
                                  <a href='/chat'>Meldinger</a>
                                  <a href='/mine-annonser'>Mine Annonser</a>
                                  <a href='/favoritter'>Favoritter</a>
                            </div>
                      </Col>
                  </Row>
                  <Row className='footer-row footer-bottom'>
                      <div className='footer-lower'>
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
