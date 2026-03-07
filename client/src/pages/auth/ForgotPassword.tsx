import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import styles from './Login.module.css';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordApi } from '../../services/authService';
import Icon from '../../components/icons/Icon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => forgotPasswordApi(email),
    onSuccess: () => setSent(true),
  });

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-brand']}>
          <div className={styles['auth-brand-icon']}>
            <Icon name="tag" />
          </div>
          <span className={styles['auth-brand-name']}>Rego</span>
        </div>

        <p className={styles['auth-title']}>Glemt passord</p>

        {sent ? (
          <>
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
              Hvis kontoen finnes, har vi sendt en e-post med instruksjoner for å tilbakestille passordet. Sjekk innboksen eller søppelpost.
            </p>
            <p className={styles['auth-footer']}>
              <a href="/login">Tilbake til innlogging</a>
            </p>
          </>
        ) : (
          <>
            <Form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
              noValidate
              className={styles['auth-form']}
            >
              <Form.Group className="mb-4" controlId="forgotEmail">
                <Form.Label>E-post</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="deg@eksempel.no"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={mutation.isPending}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className={styles['auth-submit']}
                disabled={mutation.isPending || !email}
              >
                {mutation.isPending ? <><Spinner size="sm" className="me-2" />Sender...</> : 'Send tilbakestillingslenke'}
              </Button>
            </Form>

            <p className={styles['auth-footer']}>
              <a href="/login">Tilbake til innlogging</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
