import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Avatar from '@mui/material/Avatar';

import Searchbar from "./Searchbar";
import { logoutRequest } from "../../features/userSliceActions";
import { instanceAxs } from "../../config/api.js";
import socket from "../../config/socket";

const Navigation = () => {
  const [currentY, setCurrentY] = useState(0);
  const [isRender, setIsRender] = useState(true);

  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const userObject = useSelector(state => state.user.user);
  const [user, setUser] = useState({});
  const [isUnreadMsg, setIsUnreadMsg] = useState(null)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //########## FUNCTIONS ##########

  useEffect(() => {
    const fetchChatrooms = () => {
      if(Object.keys(userObject).length === 0) return
      instanceAxs.post('/chat/get/rooms', { user: userObject?._id }).then(response => {
        response.data.forEach(element => {
          if(element.unreadMessages > 0) {
            setIsUnreadMsg(true)
          }
        });
      })
      .catch(error => {
        console.log(error)
      })
    }
    fetchChatrooms();
  }, [userObject])

  useEffect(() => {
    socket.on('getMessage', () => {
    if(Object.keys(userObject).length === 0) return
      instanceAxs.post('/chat/get/rooms', { user: userObject?._id }).then(response => {
        response.data.forEach(e => {
          if(e.unreadMessages > 0) {
            setIsUnreadMsg(true)
          }
        })
      })
      .catch(error => {
        console.log(error)
      })
    })
  }, [userObject])

  useEffect(() => {
    if(Object.keys(userObject).length === 0) return
    instanceAxs.post('/chat/get/rooms', { user: userObject?._id }).then(response => {
      response.data.forEach(e => {
        if(e.unreadMessages > 0) {
          setIsUnreadMsg(true)
        }
      })
    })
    .catch(error => {
      console.log(error)
    })
  }, [userObject])

  const scroll = () => {
    if (window.scrollY > currentY) {
      setIsRender(false)
    } else {
      setIsRender(true)
    }
    setCurrentY( window.scrollY );
  }

  const logout = () => {
    navigate('/');
    dispatch(logoutRequest())
  }

  useEffect(() => {
    setUser(userObject)
  }, [userObject])

    window.addEventListener("scroll", scroll);
    return (
      <div>
        {isRender &&
          <Navbar expand="lg" fixed="top" className="navigation" bg="light">
            <Container>
                <Navbar.Brand href="/" className="" style={{color: "black"}}>Rego</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />   
                <Navbar.Collapse id="basic-navbar-nav" style={{margin: 10}}>       

                    <Searchbar></Searchbar>
                    
                    {isLoggedIn ? 
                        <Nav className="navbar-nav">
                            <Avatar className="navbar-avatar" alt='pp' src={user.profilePicture} sx={{width: 32, height: 32, marginRight: 1}}></Avatar>
                            <DropdownButton id="dropdown-basic-button" title={user.username || user.email || ''} style={{}} variant="light">
                                <Dropdown.Item href="min-konto">Min Konto</Dropdown.Item>
                                <Dropdown.Divider/>
                                <Dropdown.Item href="/nyannonse"><i className="fa-solid fa-plus me-2"/> Ny Annonse</Dropdown.Item>
                                <Dropdown.Item href="/profil"><i className="fa-regular fa-user me-2"/> Min Profil</Dropdown.Item>
                                <Dropdown.Item href="/chat"><i className="fa-regular fa-message me-2"/>{isUnreadMsg ? <span>Meldinger <i className="fa-solid fa-circle fa-2xs mx-3" style={{color: "#0d6efd"}}/></span> : 'Meldinger'}</Dropdown.Item>
                                <Dropdown.Item href="/mine-annonser"><i className="fa-solid fa-scroll me-2"/> Mine Annonser</Dropdown.Item>
                                <Dropdown.Item href="/favoritter"><i className="fa-regular fa-heart me-2"/> Favoritter</Dropdown.Item>
                                <Dropdown.Divider/>
                                <Dropdown.Item onClick={logout}><i className="fa-solid fa-arrow-right-from-bracket me-2"/> Logg Ut</Dropdown.Item>
                            </DropdownButton>
                        </Nav>
                          :
                          <Nav className="flex-grow-1 justify-content-end">
                              <Nav.Link href='/login'color="white" className="log-in-button">Logg Inn</Nav.Link>
                              <Nav.Link href='/register'>Register</Nav.Link>
                          </Nav>
                      }
              </Navbar.Collapse>
            </Container>
        </Navbar>
        }
      </div>
    );
  
}

export default Navigation; 
