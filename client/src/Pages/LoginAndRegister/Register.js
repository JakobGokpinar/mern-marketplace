import './Register.css';

import React, { useEffect, useState } from "react";
import validator from 'validator';

import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Container, Spinner } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import {
  googleLoginRequest,
  sendSignUpRequest,
} from "../../features/userSliceActions";
import { uiSliceActions } from '../../features/uiSlice';

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const [isLoading, setIsloading] = useState(false);
    const [name, setName] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (isLoggedIn) {
          navigate("/");
        }
  // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isLoggedIn]);

    const handleGoogleAuth = (credentialResponse) => {
      dispatch(uiSliceActions.setFeedbackBanner(
        {severity: 'info', 
        msg: 'Google Service is currently under development. Please use your email to login'
      }
      ))
      return;
        dispatch(
          googleLoginRequest({
            credential: credentialResponse.credential,
            email: "example@com",
            password: "pass123",
          })
        );
      };

    //event handler olduğu için Register fonksiyonun içinde tanımlandı. 
    //başka bir tür fonnksiyon olsaydı ana fonksiyonun dışında tanımlanırdı.
    const handleSubmit = (event) => {
        event.preventDefault();

        if(validator.isEmail(email) === false) {
          dispatch(uiSliceActions.setFeedbackBanner({ 
            severity: 'error',
            msg: 'Please provide a valid email address'
          }))
          return;
        }

        setIsloading(true)
        let user = {name, lastname, email, password}
        setTimeout(() => {
            dispatch(sendSignUpRequest(user))   
            setIsloading(false)     
        }, 1000)
    }

    return(
        <Container className="signup-container" fluid>
        <Row className="signup__row">
          <Col
            lg={5}
            className="signup__chat d-flex flex-direction-column align-items-center justify-content-center"
          >
            <div className="signup-div">
              <Form onSubmit={handleSubmit} className="signup-form">
                <Form.Group className='mb-3'>
                    <Row>
                        <Col>
                        <Form.Label>Navn</Form.Label>
                    <Form.Control
                        type='text'
                        name="name"
                        onChange={e => setName(e.target.value)}
                        required/>
                        </Col>
                        <Col>
                        <Form.Label>Etternavn</Form.Label>
                    <Form.Control
                        type='text'
                        name="lastname"
                        onChange={e => setLastname(e.target.value)}
                        required/>
                        </Col>
                    </Row>
                   
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
  
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    onChange={e => setPassword(e.target.value)}
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,32}"
                    title="Must contain at least one number and one uppercase and lowercase letter, and be between 6 and 32 characters"
                    required  
                  />
                </Form.Group>
                <Form.Group
                  className="form-submit-remember mb-3"
                  controlId="formSubmitAndRemember"
                >
                  {isLoading ? (
                    <Button variant="primary">
                      <Spinner
                        size="sm"
                        className="me-2"
                        as="div"
                        aria-hidden="true"
                      ></Spinner>
                      Oppretter...
                    </Button>
                  ) : (
                    <Button variant="primary" type="submit" className="">
                      Opprett Bruker
                    </Button>
                  )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Text>
                    Har allerede en konto?{" "}
                    <a href="/login" className="login-link">
                      Logg inn
                    </a>
                    
                  </Form.Text>
                </Form.Group>
  
                <hr />
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onFailure={handleGoogleAuth}
                  text="signup_with"
                  theme="filled_blue"
                ></GoogleLogin>
              </Form>
            </div>
          </Col>
          <Col lg={7} className="signup__bg "></Col>

        </Row>
      </Container>
    )
}

export default Register;