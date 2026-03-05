import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import styles from './EmailVerify.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { verifyEmailApi } from '../../services/emailService';
import { userActions } from '../../store/userSlice';

const EmailVerify = () => {
  const user = useAppSelector(state => state.user.user);
  const [queryParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [token, setToken] = useState<string>("");
  const [alertVarient, setAlertVarient] = useState<string>("warning");
  const [alertMessage, setAlertMessage] = useState<string>("You can verify your account by clicking the verify button below");
  const [isVerifySuccessful, setIsVerifySuccessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return navigate('/');
    setToken(queryParams.get("t") || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userId = (user as import('../../types/user').User)?._id ?? '';
      const response = await verifyEmailApi(userId, token);
      if (response.success) {
        if (response.user) dispatch(userActions.setUser(response.user));
        setAlertVarient("success");
        setAlertMessage(response.message);
        setIsVerifySuccessful(true);
        setTimeout(() => navigate('/profil'), 2000);
      } else {
        setAlertVarient("danger");
        setAlertMessage(response.message);
        setIsVerifySuccessful(false);
      }
    } catch {
      setAlertVarient("danger");
      setAlertMessage("Noe gikk galt. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['email-verify-container']}>
      <div className={styles['email-verify-content']}>
        <Alert variant={alertVarient} className={styles['content__alert']}>
          <i className={`fa-solid ${isVerifySuccessful ? 'fa-circle-check' : 'fa-triangle-exclamation'} fa-lg mx-2`} />
          {alertMessage}
        </Alert>
        <Form.Label className={styles['content__token-label']}>Token</Form.Label>
        <Form.Control type='text' className={styles['content__token-input']} value={token} disabled />
        <Button variant="success" className={styles['content__verify-button']} onClick={verify}>
          {isLoading && <Spinner className='mx-3' size='sm' />}
          Verify Email
        </Button>
      </div>
    </div>
  );
};

export default EmailVerify;
