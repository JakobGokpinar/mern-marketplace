import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom"
import './Footer.css';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';

import logo from "../../utils/Rego.png";

const Footer = () => {

  const [isRender, setIsRender] = useState(true)
  const location = useLocation();

  useEffect(() => {
    const fetchPathname = () => {
      if(location.pathname === '/nyannonse') {
        setIsRender(false)
      }
    }
    fetchPathname();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])   

  return (
    <div className='footer-container'>
      {isRender && 
              <div className='footer-div'>
                  <Row className='footer-row'>
                      <Col className='footer-col'lg={4} md={4} sm={12}>
                          <img alt='logo' src={logo} className='footer-logo'/>
                      </Col>
                      <Col  className='footer-col footer-quicklinks'lg={4} md={4} sm={12}>
                          <div className='footer-content'>
                              <p className='footer-heading'> Quick Links</p>
                              <a href='/privacy-policy'>Privacy Policy</a>
                              <a href='/about-us'>About Us</a>
                          </div>
                      </Col>
                      <Col className='footer-col footer-useractions'lg={4} md={4} sm={12}>
                        <div className='footer-content'>
                                  <p className='footer-heading'>User Actions</p>
                                  <a href='/profil'>Min Profil</a>
                                  <a href='/nyannonse'>Ny Annonse</a>
                                  <a href='/chat'>Meldinger</a>
                                  <a href='/mine-annonser'>Mine Annonser</a>
                                  <a href='/favoritter'>Favoritter</a>
                            </div>
                      </Col>
                  </Row>
                  <Row className='footer-row bg-dark'>
                      <div className='footer-lower'>
                        <p style={{margin: 0}}>
                          © 2023 GokSoft Technologies - All Rights Reserved
                        </p>
                      </div>
                  </Row>
            </div>
      }
    </div>
  )
}

export default Footer;
