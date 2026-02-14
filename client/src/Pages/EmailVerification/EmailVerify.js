import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './EmailVerify.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { instanceAxs } from '../../config/api.js'
import userSlice from '../../features/userSlice';

const EmailVerify = () => {
    const user = useSelector(state => state.user.user);

    const [queryParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [token, setToken] = useState("");
    const [alertVarient, setAlertVarient] = useState("warning")
    const [alertMessage, setAlertMessage] = useState("You can verify your account by clicking the verify button below")
    const [isVerifySuccessful, setIsVerifySuccessful] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if(!user) {
            return navigate('/')
        }
        setToken(queryParams.get("t"))
    }, [])

    const verify = (e) => {
        e.preventDefault();
        setIsLoading(true)
        instanceAxs.post('/email/verify', {userId: user?._id, token})
        .then(response => {
            console.log(response)
            if(response.data.success === true) {
                dispatch(userSlice.actions.setUser(response.data.user))
                setAlertVarient("success")
                setAlertMessage(response.data.message)
                setIsVerifySuccessful(true)
                setIsLoading(false)
                setTimeout(() => {
                    navigate('/profil')
                }, 2000)
            } else {
                setAlertVarient("danger");
                setAlertMessage(response.data.message)
                setIsVerifySuccessful(false)
                setIsLoading(false)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    return (
    <div className='email-verify-container'>
        <div className='email-verify-content'>
            <Alert variant={alertVarient} className='content__alert'><i className={`fa-solid ${isVerifySuccessful ? 'fa-circle-check' : 'fa-triangle-exclamation'} fa-lg mx-2`}/>{alertMessage}</Alert>
            <Form.Label className='content__token-label'>Token</Form.Label>
            <Form.Control type='text' className='content__token-input' value={token} disabled></Form.Control>
            <Button variant="success" className='content__verify-button' onClick={verify}>{isLoading && <Spinner className='mx-3' size='sm'/> }Verify Email</Button>
        </div>
    </div>
  )
}

export default EmailVerify;
