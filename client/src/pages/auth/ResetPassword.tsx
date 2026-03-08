import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import styles from './Login.module.css';
import accountStyles from '../account/Account.module.css';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { resetPasswordApi } from '../../services/authService';
import toast from 'react-hot-toast';
import Icon from '../../components/icons/Icon';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t') || '';
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const isValid = newPassword.length >= 6 && /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

  const mutation = useMutation({
    mutationFn: () => resetPasswordApi(token, newPassword),
    onSuccess: (data) => {
      toast.success(data.message);
      setDone(true);
    },
    onError: (error) => {
      const msg = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(msg || 'Kunne ikke tilbakestille passord');
    },
  });

  if (!token) {
    return (
      <div className={styles['auth-page']}>
        <div className={styles['auth-card']}>
          <p className={styles['auth-title']}>Ugyldig lenke</p>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            Denne lenken er ugyldig eller utløpt.
          </p>
          <p className={styles['auth-footer']}>
            <a href="/forgot-password">Be om ny lenke</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-brand']}>
          <div className={styles['auth-brand-icon']}>
            <Icon name="tag" />
          </div>
          <span className={styles['auth-brand-name']}>Rego</span>
        </div>

        <p className={styles['auth-title']}>Nytt passord</p>

        {done ? (
          <>
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
              Passordet ditt er oppdatert. Du kan nå logge inn med det nye passordet.
            </p>
            <p className={styles['auth-footer']}>
              <a href="/login">Logg inn</a>
            </p>
          </>
        ) : (
          <>
            <Form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
              noValidate
              className={styles['auth-form']}
            >
              <Form.Group className="mb-3" controlId="resetPassword">
                <Form.Label>Nytt passord</Form.Label>
                <div className={styles['password-wrapper']}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Velg et nytt passord"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={mutation.isPending}
                  />
                  <button type="button" className={styles['password-toggle']} onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    <Icon name={showPassword ? 'eye-slash' : 'eye-outline'} size={14} />
                  </button>
                </div>
              </Form.Group>

              {newPassword.length > 0 && (
                <ul className={accountStyles['password-rules']} style={{ marginBottom: 16 }}>
                  <li className={newPassword.length >= 6 ? accountStyles['rule-pass'] : accountStyles['rule-fail']}>Minst 6 tegn</li>
                  <li className={/[a-zA-Z]/.test(newPassword) ? accountStyles['rule-pass'] : accountStyles['rule-fail']}>Minst én bokstav</li>
                  <li className={/\d/.test(newPassword) ? accountStyles['rule-pass'] : accountStyles['rule-fail']}>Minst ett tall</li>
                </ul>
              )}

              <Button
                variant="primary"
                type="submit"
                className={styles['auth-submit']}
                disabled={mutation.isPending || !isValid}
              >
                {mutation.isPending ? <><Spinner size="sm" className="me-2" />Oppdaterer...</> : 'Oppdater passord'}
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

export default ResetPassword;
