import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ListingCard.module.css";

import Carousel from 'react-bootstrap/Carousel';
import Spinner from "react-bootstrap/Spinner";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import Icon from '../icons/Icon';
import { useFavorites } from "../../hooks/useFavorites";
import toast from 'react-hot-toast';
import { useAppSelector } from "../../store/hooks";
import { formatPrice } from "../../utils/formatPrice";

interface ListingCardProps {
  images?: Array<{ location: string }>;
  title?: string;
  location?: string;
  price?: number | string;
  id?: string | null;
  description?: string;
  sellerId?: string;
}

function ListingCard({
  images = [],
  title = "Uten tittel",
  location = "",
  price = "0",
  id = null,
  sellerId,
}: ListingCardProps) {

  const siteLink = import.meta.env.VITE_SITE_URL || window.location.origin;
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();

  const { toggleFavorite, isLoading, isInFavorites } = useFavorites();
  const [showModal, setShowModal] = useState(false);

  const saved = id ? isInFavorites(id) : false;

  const handleToggleFavorite = () => {
    if (!id) return;
    if (!user?._id) {
      toast.error('Logg inn for å lagre favoritter');
      return;
    }
    toggleFavorite(id, saved);
  };

  const handleSendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (user?._id === sellerId) return;
    navigate("/chat", {
      state: {
        buyer: user?._id,
        seller: sellerId,
        product_id: id,
      },
    });
  };

  const handleCopyLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${siteLink}/l/${id}`);
    toast.success('Lenken kopiert');
    setShowModal(false);
  };

  return (
    <div className={styles['product-card']}>
      <div className={styles['product-card__image-wrapper']}>
        <Carousel indicators={false} controls={images.length > 1} interval={null}>
          {images.map((img, index) => (
            <Carousel.Item key={index}>
              <Link to={`/l/${id}`}>
                <img src={img.location} alt={title} loading="lazy" />
              </Link>
            </Carousel.Item>
          ))}
        </Carousel>

        {user?._id !== sellerId && (
          <button
            className={styles['product-card__favorite'] + (saved ? ` ${styles['product-card__favorite--active']}` : '')}
            onClick={handleToggleFavorite}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size="sm" animation="border" className={styles['product-card__favorite-spinner']} />
            ) : (
              <Icon name={saved ? "heart" : "heart-outline"} />
            )}
          </button>
        )}

        {images.length > 1 && (
          <span className={styles['product-card__img-count']}>
            <Icon name="image-outline" style={{ marginRight: 4 }} />
            {images.length}
          </span>
        )}
      </div>

      <div className={styles['product-card__content']}>
        <div className={styles['product-card__price']}>{formatPrice(price)}</div>
        <div className={styles['product-card__title']}>{title}</div>
        {location && (
          <div className={styles['product-card__location']}>
            <Icon name="location-dot" />
            {location}
          </div>
        )}
      </div>

      <div className={styles['product-card__actions']}>
        <button className={`${styles['product-card__action-btn']} ${styles['product-card__action-btn--primary']}`} onClick={handleSendMessage}>
          <Icon name="message-outline" style={{ marginRight: 4 }} />
          Melding
        </button>
        <button className={styles['product-card__action-btn']} onClick={() => setShowModal(true)}>
          <Icon name="arrow-up-from-bracket" style={{ marginRight: 4 }} />
          Del
        </button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Del annonsen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            className="mb-3"
            value={`${siteLink}/l/${id}`}
            readOnly
          />
          <Button variant="primary" onClick={handleCopyLink}>
            Kopier Lenken
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ListingCard;
