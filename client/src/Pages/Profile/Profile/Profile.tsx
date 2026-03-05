import styles from "./Profile.module.css";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import { useMutation } from "@tanstack/react-query";

import Breadcrumb from "react-bootstrap/Breadcrumb";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from 'react-bootstrap/Alert';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";

import { getCroppedImage } from '../../../utils/cropImage';
import { dataURLtoFile } from "../../../utils/dataURltoFile";
import {
  uploadProfilePictureApi,
  updateUserInfoApi,
  removeProfilePictureApi,
  deleteAccountApi,
} from "../../../services/profileService";
import { resendVerificationEmailApi } from "../../../services/emailService";
import { userActions } from "../../../store/userSlice";
import { uiSliceActions } from "../../../store/uiSlice";

const Profile = () => {
  const userState = useAppSelector(state => state.user.user);
  const user = userState as import('../../../types/user').User;
  const dispatch = useDispatch();
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [readerResult, setReaderResult] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const convertImagesToFormData = async (data: string): Promise<FormData> => {
    const fd = new FormData();
    const canvas = await getCroppedImage(data);
    const canvasDataUrl = canvas.toDataURL("image/jpeg");
    const convertedUrltoFile = dataURLtoFile(canvasDataUrl, "profilePicture.jpg");
    return new Promise<FormData>((resolve) => {
      fd.append("profileImage", convertedUrltoFile);
      resolve(fd);
    });
  };

  const convertToBase64 = (file: File): Promise<{ name: string; data: string | ArrayBuffer | null }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({ name: file.name, data: reader.result });
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleButtonClick = () => {
    if (!hiddenFileInput.current) return;
    hiddenFileInput.current.value = "";
    hiddenFileInput.current.click();
  };

  const handleCancel = () => {
    setName(user.name);
    setLastName(user.lastname);
    setReaderResult(null);
  };

  useEffect(() => {
    if (!imageFile) return;
    const convertImage = async () => {
      const convertedImage = await convertToBase64(imageFile);
      const dataStr = typeof convertedImage.data === 'string' ? convertedImage.data : null;
      setReaderResult(dataStr);
      if (dataStr) {
        const fd = await convertImagesToFormData(dataStr);
        setFormData(fd);
      }
    };
    convertImage();
  }, [imageFile]);

  useEffect(() => {
    setName(user.name);
    setLastName(user.lastname);
    setProfilePicture(user.profilePicture ?? '');
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (formData) {
        const picRes = await uploadProfilePictureApi(formData);
        if (picRes.user) dispatch(userActions.setUser(picRes.user));
      }
      const infoRes = await updateUserInfoApi({ name, lastname: lastName });
      if (infoRes.user) dispatch(userActions.setUser(infoRes.user));
      return infoRes;
    },
    onSuccess: (data) => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: data.message }));
    },
    onError: () => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Kunne ikke oppdatere profil' }));
    },
  });

  const removePicMutation = useMutation({
    mutationFn: removeProfilePictureApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'info', msg: data.message }));
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      dispatch(userActions.logout());
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: 'Kontoen din er slettet' }));
      window.location.href = '/';
    },
    onError: () => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Kunne ikke slette kontoen' }));
    },
  });

  const sendVerificationEmail = () => {
    resendVerificationEmailApi(user.email, user.username ?? '', user._id)
      .then(response => {
        dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: response.message }));
      })
      .catch(() => {
        dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Kunne ikke sende e-post' }));
      });
  };

  const avatarSrc = readerResult || (profilePicture !== "" ? profilePicture : null);

  return (
    <div className={styles['profile-container']}>
      <Breadcrumb>
        <Breadcrumb.Item href="/min-konto">Min Konto</Breadcrumb.Item>
        <Breadcrumb.Item active>Profil</Breadcrumb.Item>
      </Breadcrumb>

      {!user.isEmailVerified && (
        <Alert variant="danger">
          <Alert.Heading>
            <i className="fa-solid fa-circle-exclamation me-2" />
            Your account has not been verified
          </Alert.Heading>
          <p>
            To verify your account, you need to follow the steps in the email sent to you.
            If you need to receive a new email, <Alert.Link onClick={sendVerificationEmail}>you can click here</Alert.Link>.
            By having a verified account, you can create and publish your announcements.
          </p>
        </Alert>
      )}

      <div className={styles['profile-content']}>
        <Row className={styles['profile-content-row']}>
          <Col className={`${styles['profile-content-col']} ${styles['content-profileImage']}`} lg={3}>
            <div className={styles['content-profileImage-div']}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar profile-avatar--placeholder">
                  <i className="fa-solid fa-user" />
                </div>
              )}
            </div>
            <div className={styles['between']}>
              <Form.Control
                type="file"
                accept="image/*"
                ref={hiddenFileInput}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Button className={styles['avatar-control-buttons']} variant="primary" onClick={handleButtonClick}>
                Endre
              </Button>
              <Button className={styles['avatar-control-buttons']} variant="outline-danger" onClick={() => removePicMutation.mutate()}>
                Reset
              </Button>
            </div>
          </Col>

          <Col lg={4} className={`${styles['profile-content-col']} ${styles['user-actions']}`}>
            <Form>
              <Form.Group className={styles['profile-form-element']}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" defaultValue={user.email} disabled />
              </Form.Group>
              <Row className={styles['profile-form-element']}>
                <Col>
                  <Form.Group>
                    <Form.Label>Navn</Form.Label>
                    <Form.Control type="text" value={name || ""} onChange={(e) => setName(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Etternavn</Form.Label>
                    <Form.Control type="text" value={lastName || ""} onChange={(e) => setLastName(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            <div className={styles['profile-control-buttons']}>
              <Button className={styles['control-button']} variant="outline-primary" onClick={handleCancel}>
                Avbryt
              </Button>
              {updateMutation.isPending ? (
                <Button className={styles['control-button']} disabled>
                  <Spinner animation="border" size="sm" className="me-3" />
                  Lagrer...
                </Button>
              ) : (
                <Button className={styles['control-button']} variant="primary" onClick={() => updateMutation.mutate()}>
                  Lagre
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div>

      <div className={styles['profile-delete-section']}>
        <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
          Slett konto
        </Button>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Slett konto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Er du sikker? Alle dine annonser, meldinger og data vil bli permanent slettet.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Avbryt
          </Button>
          <Button variant="danger" onClick={() => { setShowDeleteModal(false); deleteAccountMutation.mutate(); }}>
            Slett konto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
