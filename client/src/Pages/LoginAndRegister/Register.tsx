import styles from './Register.module.css';

import { useEffect, useState } from "react";
import validator from 'validator';

import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Container, Spinner } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendSignUpRequest } from "../../store/authThunks";
import { uiSliceActions } from '../../store/uiSlice';

function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsloading] = useState(false);
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validator.isEmail(email)) {
      dispatch(uiSliceActions.setFeedbackBanner({
        severity: 'error',
        msg: 'Please provide a valid email address',
      }));
      return;
    }

    setIsloading(true);
    await dispatch(sendSignUpRequest({ name, lastname, email, password }));
    setIsloading(false);
  };

  return (
    <Container className="signup-container" fluid>
      <Row className={styles['signup__row']}>
        <Col
          lg={5}
          className="signup__chat d-flex flex-direction-column align-items-center justify-content-center"
        >
          <div className={styles['signup-div']}>
            <Form onSubmit={handleSubmit} className="signup-form">
              <Form.Group className='mb-3'>
                <Row>
                  <Col>
                    <Form.Label>Navn</Form.Label>
                    <Form.Control type='text' name="name" onChange={e => setName(e.target.value)} required />
                  </Col>
                  <Col>
                    <Form.Label>Etternavn</Form.Label>
                    <Form.Control type='text' name="lastname" onChange={e => setLastname(e.target.value)} required />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" name="email" onChange={e => setEmail(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={e => setPassword(e.target.value)}
                  pattern="(?=.*\d)(?=.*[a-zA-Z]).{6,32}"
                  title="Must contain at least one letter and one digit, and be between 6 and 32 characters"
                  required
                />
              </Form.Group>
              <Form.Group className="form-submit-remember mb-3" controlId="formSubmitAndRemember">
                {isLoading ? (
                  <Button variant="primary" disabled>
                    <Spinner size="sm" className="me-2" />
                    Oppretter...
                  </Button>
                ) : (
                  <Button variant="primary" type="submit">
                    Opprett Bruker
                  </Button>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>
                  Har allerede en konto?{" "}
                  <a href="/login" className={styles['login-link']}>Logg inn</a>
                </Form.Text>
              </Form.Group>
            </Form>
          </div>
        </Col>
        <Col lg={7} className={styles['signup__bg']} />
      </Row>
    </Container>
  );
}

export default Register;
