import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useMutation } from '@tanstack/react-query';
import type { User } from '../../types/user';
import styles from './Account.module.css';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

import Icon from '../../components/icons/Icon';
import { useTheme } from '../../hooks/useTheme';
import { compressProfileImage } from '../../utils/compressImage';
import {
  uploadProfilePictureApi,
  updateUserInfoApi,
  removeProfilePictureApi,
  changePasswordApi,
  changeEmailApi,
  deleteAccountApi,
} from '../../services/profileService';
import { resendVerificationEmailApi } from '../../services/emailService';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { userActions } from '../../store/userSlice';
import { logoutRequest } from '../../store/authThunks';
import { useFormValidation } from '../../hooks/useFormValidation';
import { profileSchema } from '../../schemas/profile.schema';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const user = useAppSelector(state => state.user.user) as User;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const { errors: formErrors, validate } = useFormValidation(profileSchema);

  useEffect(() => {
    setFullName(user.fullName);
  }, [user]);

  // Image processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataStr = reader.result as string;
      setPreviewSrc(dataStr);
      const blob = await compressProfileImage(dataStr);
      const fd = new FormData();
      fd.append('profileImage', new File([blob], 'profilePicture.jpg', { type: 'image/jpeg' }));
      setFormData(fd);
    };
    reader.readAsDataURL(file);
  };

  const uploadPicMutation = useMutation({
    mutationFn: (fd: FormData) => uploadProfilePictureApi(fd),
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast.success('Profilbilde oppdatert');
      setPreviewSrc(null);
      setFormData(null);
    },
    onError: () => toast.error('Kunne ikke laste opp bilde'),
  });

  const removePicMutation = useMutation({
    mutationFn: removeProfilePictureApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast.success(data.message);
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: () => updateUserInfoApi({ fullName }),
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast.success('Navn oppdatert');
      setEditingName(false);
    },
    onError: () => toast.error('Kunne ikke oppdatere navn'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      dispatch(userActions.logout());
      toast.success('Kontoen din er slettet');
      window.location.href = '/';
    },
    onError: () => toast.error('Kunne ikke slette kontoen'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePasswordApi(currentPassword, newPassword),
    onSuccess: (data) => {
      toast.success(data.message);
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error) => {
      const msg = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(msg || 'Kunne ikke endre passord');
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: () => changeEmailApi(newEmail),
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast.success(data.message);
      setEditingEmail(false);
      setNewEmail('');
    },
    onError: (error) => {
      const msg = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(msg || 'Kunne ikke endre e-post');
    },
  });

  const sendVerificationEmail = () => {
    resendVerificationEmailApi(user.email, user.fullName, user._id)
      .then(res => toast.success(res.message))
      .catch(() => toast.error('Kunne ikke sende e-post'));
  };

  const avatarSrc = previewSrc || user.profilePicture || null;

  return (
    <div className={styles['account']}>
      <h1 className={styles['account-heading']}>Min Konto</h1>

      {!user.isEmailVerified && (
        <Alert variant="warning" className={styles['verification-alert']}>
          <Icon name="circle-exclamation" style={{ marginRight: 8 }} />
          Bekreft e-postadressen din for å legge ut annonser.{' '}
          <Alert.Link onClick={sendVerificationEmail}>Send bekreftelsesmail</Alert.Link>
        </Alert>
      )}

      {/* ---- Profile section ---- */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Profil</h2>

        {/* Avatar */}
        <div className={styles['avatar-row']}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className={styles['avatar-preview']} />
          ) : (
            <div className={styles['avatar-placeholder']}>
              <Icon name="user" size={34} />
            </div>
          )}
          <div className={styles['avatar-actions']}>
            <Form.Control
              type="file"
              accept="image/*"
              ref={hiddenFileInput}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="outline-primary"
              onClick={() => { hiddenFileInput.current!.value = ''; hiddenFileInput.current!.click(); }}
            >
              {user.profilePicture ? 'Endre bilde' : 'Last opp bilde'}
            </Button>
            {previewSrc && formData && (
              <Button
                variant="primary"
                onClick={() => uploadPicMutation.mutate(formData)}
                disabled={uploadPicMutation.isPending}
              >
                {uploadPicMutation.isPending ? <Spinner size="sm" /> : 'Lagre'}
              </Button>
            )}
            {user.profilePicture && !previewSrc && (
              <Button variant="outline-danger" onClick={() => removePicMutation.mutate()}>
                Fjern
              </Button>
            )}
            {previewSrc && (
              <Button variant="outline-secondary" onClick={() => { setPreviewSrc(null); setFormData(null); }}>
                Avbryt
              </Button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className={styles['row']}>
          <span className={styles['row-label']}>Navn</span>
          {editingName ? (
            <>
              <div className={styles['edit-form']}>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  isInvalid={!!formErrors.fullName}
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">{formErrors.fullName}</Form.Control.Feedback>
              </div>
              <div className={styles['edit-actions']}>
                <Button variant="outline-secondary" onClick={() => { setEditingName(false); setFullName(user.fullName); }}>
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { if (validate({ fullName })) updateNameMutation.mutate(); }}
                  disabled={updateNameMutation.isPending}
                >
                  {updateNameMutation.isPending ? <Spinner size="sm" /> : 'Lagre'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className={styles['row-value']}>{user.fullName}</span>
              <div className={styles['row-action']}>
                <Button variant="outline-primary" onClick={() => setEditingName(true)}>Endre</Button>
              </div>
            </>
          )}
        </div>

        {/* Email */}
        <div className={styles['row']}>
          <span className={styles['row-label']}>E-post</span>
          {editingEmail ? (
            <>
              <div className={styles['edit-form']}>
                <Form.Control
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Ny e-postadresse"
                  autoFocus
                />
              </div>
              <div className={styles['edit-actions']}>
                <Button variant="outline-secondary" onClick={() => { setEditingEmail(false); setNewEmail(''); }}>
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={() => changeEmailMutation.mutate()}
                  disabled={changeEmailMutation.isPending || !newEmail || newEmail === user.email}
                >
                  {changeEmailMutation.isPending ? <Spinner size="sm" /> : 'Lagre'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className={styles['row-value']}>{user.email}</span>
              <div className={styles['row-action']}>
                <Button variant="outline-primary" onClick={() => { setEditingEmail(true); setNewEmail(user.email); }}>Endre</Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Security section ---- */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Sikkerhet</h2>
        <div className={styles['row']}>
          <span className={styles['row-label']}>Passord</span>
          {editingPassword ? (
            <>
              <div className={styles['password-form']}>
                <Form.Control
                  type="password"
                  placeholder="Nåværende passord"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoFocus
                />
                <div className={styles['password-wrapper']}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nytt passord"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" className={styles['password-toggle']} onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    <Icon name={showPassword ? 'eye-slash' : 'eye-outline'} size={14} />
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <ul className={styles['password-rules']}>
                    <li className={newPassword.length >= 6 ? styles['rule-pass'] : styles['rule-fail']}>Minst 6 tegn</li>
                    <li className={/[a-zA-Z]/.test(newPassword) ? styles['rule-pass'] : styles['rule-fail']}>Minst én bokstav</li>
                    <li className={/\d/.test(newPassword) ? styles['rule-pass'] : styles['rule-fail']}>Minst ett tall</li>
                  </ul>
                )}
                <div className={styles['password-actions']}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => { setEditingPassword(false); setCurrentPassword(''); setNewPassword(''); }}
                  >
                    Avbryt
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => changePasswordMutation.mutate()}
                    disabled={changePasswordMutation.isPending || !currentPassword || newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)}
                  >
                    {changePasswordMutation.isPending ? <Spinner size="sm" /> : 'Lagre'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className={styles['row-value']}>********</span>
              <div className={styles['row-action']}>
                <Button variant="outline-primary" onClick={() => setEditingPassword(true)}>Endre</Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Appearance section ---- */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Utseende</h2>
        <div className={styles['row']}>
          <span className={styles['row-label']}>Mørk modus</span>
          <Form.Check type="switch" className={styles['theme-switch']} checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </div>

      {/* ---- Logout ---- */}
      <div className={styles['section']}>
        <Button
          variant="outline-secondary"
          className={styles['logout-btn']}
          onClick={() => { navigate('/'); dispatch(logoutRequest()); }}
        >
          <Icon name="arrow-right-from-bracket" style={{ marginRight: 8 }} />
          Logg ut
        </Button>
      </div>

      {/* ---- Danger zone ---- */}
      <div className={`${styles['section']} ${styles['section-danger']}`}>
        <h2 className={styles['section-title']}>Faresone</h2>
        <div className={styles['danger-row']}>
          <p className={styles['danger-text']}>
            Sletter kontoen din permanent, inkludert alle annonser, meldinger og data.
          </p>
          <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
            Slett konto
          </Button>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Slett konto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Er du sikker? Alle dine annonser, meldinger og data vil bli permanent slettet.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Avbryt</Button>
          <Button
            variant="danger"
            onClick={() => { setShowDeleteModal(false); deleteAccountMutation.mutate(); }}
            disabled={deleteAccountMutation.isPending}
          >
            Slett konto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Account;
