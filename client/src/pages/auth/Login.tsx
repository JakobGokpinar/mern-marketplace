import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendLoginRequest } from "../../store/authThunks";
import { useFormValidation } from "../../hooks/useFormValidation";
import { loginSchema } from "../../schemas/auth.schema";
import Icon from '../../components/icons/Icon';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const { errors, validate } = useFormValidation(loginSchema);

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!validate({ email, password })) return;

    setIsLoading(true);
    await dispatch(sendLoginRequest({ email, password }));
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

        <p className={styles['auth-title']}>Logg inn på kontoen din</p>

        <Form onSubmit={handleSubmit} noValidate className={styles['auth-form']}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>E-post</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="deg@eksempel.no"
              disabled={isLoading}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label>Passord</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="••••••••"
              disabled={isLoading}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className={styles['auth-submit']} disabled={isLoading}>
            {isLoading ? <><Spinner size="sm" className="me-2" />Logger inn...</> : 'Logg inn'}
          </Button>
        </Form>

        <p className={styles['auth-footer']}>
          <a href="/forgot-password">Glemt passord?</a>
        </p>
        <p className={styles['auth-footer']}>
          Ny her? <a href="/register">Opprett en konto</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
