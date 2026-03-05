import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Row, Col, Container, Spinner } from "react-bootstrap";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendLoginRequest } from "../../store/authThunks";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsloading(true);
    const form = event.currentTarget;
    const email = (form.elements[0] as HTMLInputElement).value;
    const password = (form.elements[1] as HTMLInputElement).value;
    await dispatch(sendLoginRequest({ email, password }));
    setIsloading(false);
  };

  return (
    <Container className="login-container" fluid>
      <Row className={styles['login__row']}>
        <Col
          lg={5}
          className="login__chat d-flex flex-direction-column align-items-center justify-content-center"
        >
          <div className={styles['login-div']}>
            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  disabled={isLoading}
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
              <Form.Group className="mb-3" controlId="formSubmitAndRemember">
                {isLoading ? (
                  <Button variant="primary" type="submit" disabled>
                    <Spinner size="sm" className="me-2" />
                    Logger Inn...
                  </Button>
                ) : (
                  <Button variant="primary" type="submit">
                    Logg Inn
                  </Button>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>
                  Har ikke en konto?{" "}
                  <a href="/register" className={styles['signup-link']}>
                    Opprett en her
                  </a>
                </Form.Text>
              </Form.Group>
            </Form>
          </div>
        </Col>
        <Col lg={7} className={styles['login__bg']} />
      </Row>
    </Container>
  );
};

export default Login;
