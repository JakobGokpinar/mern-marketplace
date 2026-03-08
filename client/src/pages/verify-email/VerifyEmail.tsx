import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useAppDispatch } from '../../store/hooks';
import styles from './VerifyEmail.module.css';

import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { verifyEmailApi } from '../../services/emailService';
import { userActions } from '../../store/userSlice';
import Icon from '../../components/icons/Icon';

const VerifyEmail = () => {
  const user = useAppSelector(state => state.user.user);
  const [queryParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const token = queryParams.get('t') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ugyldig lenke — token mangler.');
    }
  }, [token]);

  const verify = async () => {
    setStatus('loading');
    try {
      const response = await verifyEmailApi(token);
      if (response.success) {
        setStatus('success');
        setMessage(response.message);
        if (response.user && user) {
          dispatch(userActions.setUser(response.user));
        }
      } else {
        setStatus('error');
        setMessage(response.message);
      }
    } catch {
      setStatus('error');
      setMessage('Noe gikk galt. Prøv igjen.');
    }
  };

  return (
    <div className={styles['container']}>
      <div className={styles['card']}>
        <div className={styles['icon-circle']}>
          <Icon
            name={status === 'success' ? 'circle-check' : 'envelope'}
            size={28}
          />
        </div>

        <h1 className={styles['title']}>
          {status === 'success' ? 'E-post bekreftet!' : 'Bekreft e-postadressen din'}
        </h1>

        {status === 'success' ? (
          <>
            <p className={styles['description']}>{message}</p>
            {user ? (
              <Button variant="primary" className={styles['btn']} onClick={() => navigate('/account')}>
                Gå til min konto
              </Button>
            ) : (
              <Button variant="primary" className={styles['btn']} onClick={() => navigate('/login')}>
                Logg inn
              </Button>
            )}
          </>
        ) : status === 'error' ? (
          <>
            <Alert variant="danger" className={styles['alert']}>
              <Icon name="triangle-exclamation" size={16} style={{ marginRight: 8 }} />
              {message}
            </Alert>
            {user && (
              <p className={styles['description']}>
                <a href="/account">Gå til min konto</a> for å sende en ny bekreftelsesmail.
              </p>
            )}
          </>
        ) : (
          <>
            <p className={styles['description']}>
              Klikk på knappen under for å bekrefte e-postadressen din.
            </p>
            <Button
              variant="primary"
              className={styles['btn']}
              onClick={verify}
              disabled={status === 'loading' || !token}
            >
              {status === 'loading' ? <><Spinner size="sm" className="me-2" />Bekrefter...</> : 'Bekreft e-post'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
