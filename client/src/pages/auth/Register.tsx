import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendSignUpRequest } from "../../store/authThunks";
import { useFormValidation } from "../../hooks/useFormValidation";
import { registerSchema } from "../../schemas/auth.schema";
import Icon from '../../components/icons/Icon';

function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, validate } = useFormValidation(registerSchema);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate({ fullName, email, password })) return;

    setIsLoading(true);
    await dispatch(sendSignUpRequest({ fullName, email, password }));
    setIsLoading(false);
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-brand']}>
          <div className={styles['auth-brand-icon']}>
            <Icon name="tag" />
          </div>
          <span className={styles['auth-brand-name']}>Rego</span>
        </div>

        <p className={styles['auth-title']}>Opprett en konto</p>

        <Form onSubmit={handleSubmit} noValidate className={styles['auth-form']}>
          <Form.Group className="mb-3">
            <Form.Label>Fullt navn</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              placeholder="Ola Nordmann"
              onChange={e => setFullName(e.target.value)}
              disabled={isLoading}
              isInvalid={!!errors.fullName}
            />
            <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>E-post</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="deg@eksempel.no"
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="registerPassword">
            <Form.Label>Passord</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className={styles['auth-submit']} disabled={isLoading}>
            {isLoading ? <><Spinner size="sm" className="me-2" />Oppretter...</> : 'Opprett konto'}
          </Button>
        </Form>

        <p className={styles['auth-footer']}>
          Har allerede en konto? <a href="/login">Logg inn</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
