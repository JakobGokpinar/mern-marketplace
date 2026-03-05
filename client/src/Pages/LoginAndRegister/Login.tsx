import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendLoginRequest } from "../../store/authThunks";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const email = (form.elements[0] as HTMLInputElement).value;
    const password = (form.elements[1] as HTMLInputElement).value;
    await dispatch(sendLoginRequest({ email, password }));
    setIsLoading(false);
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-brand']}>
          <div className={styles['auth-brand-icon']}>
            <i className="fa-solid fa-tag" />
          </div>
          <span className={styles['auth-brand-name']}>Rego</span>
        </div>

        <p className={styles['auth-title']}>Logg inn på kontoen din</p>

        <Form onSubmit={handleSubmit} className={styles['auth-form']}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>E-post</Form.Label>
            <Form.Control type="email" name="email" placeholder="deg@eksempel.no" disabled={isLoading} required />
          </Form.Group>

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label>Passord</Form.Label>
            <Form.Control type="password" name="password" placeholder="••••••••" disabled={isLoading} required />
          </Form.Group>

          <Button variant="primary" type="submit" className={styles['auth-submit']} disabled={isLoading}>
            {isLoading ? <><Spinner size="sm" className="me-2" />Logger inn...</> : 'Logg inn'}
          </Button>
        </Form>

        <p className={styles['auth-footer']}>
          Ny her? <a href="/register">Opprett en konto</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
