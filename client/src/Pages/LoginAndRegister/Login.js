import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Container, Spinner } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";
import { useDispatch, useSelector } from "react-redux";
import {
  googleLoginRequest,
  sendLoginRequest,
} from "../../features/userSliceActions";
import { uiSliceActions } from "../../features/uiSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsloading(true);
    const email = event.target[0].value;
    const password = event.target[1].value;
    setTimeout(() => {
      dispatch(sendLoginRequest({ email, password }));
      setIsloading(false)
    }, 1000);
  };

  const handleGoogleAuth = (credentialResponse) => {
    dispatch(uiSliceActions.setFeedbackBanner({
      severity: 'info', 
      msg: 'Google Service is currently under development. Please use your email to login'
    }))
  return;
    dispatch(
      googleLoginRequest({
        credential: credentialResponse.credential,
        email: "example@com",
        password: "pass123",
      })
    );
  };

  return (
    <Container className="login-container" fluid>
      <Row className="login__row">
        <Col
          lg={5}
          className="login__chat d-flex flex-direction-column align-items-center justify-content-center"
        >
          <div className="login-div">
            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  disabled={isLoading === true}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  disabled={isLoading}
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="formSubmitAndRemember"
              >
                {isLoading ? (
                  <Button variant="primary" type="submit">
                    <Spinner
                      size="sm"
                      className="me-2"
                      as="div"
                      aria-hidden="true"
                      disabled={isLoading}
                    ></Spinner>
                    Logger Inn...
                  </Button>
                ) : (
                  <Button variant="primary" type="submit" className="">
                    Logg Inn
                  </Button>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Text>
                  Har ikke en konto?{" "}
                  <a href="/register" className="signup-link">
                    Opprett en her
                  </a>
                </Form.Text>
              </Form.Group>

              <hr />
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onFailure={handleGoogleAuth}
                text="signin_with"
                theme="filled_blue"
              ></GoogleLogin>
            </Form>
          </div>
        </Col>
        <Col lg={7} className="login__bg "></Col>
      </Row>
    </Container>
  );
};

export default Login;
