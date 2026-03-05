import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

import Carousel from 'react-bootstrap/Carousel';
import Spinner from "react-bootstrap/Spinner";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { useFavorites } from "../../hooks/useFavorites";
import { uiSliceActions } from "../../store/uiSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";

interface ProductCardProps {
  images?: Array<{ location: string }>;
  title?: string;
  location?: string;
  price?: number | string;
  id?: string | null;
  description?: string;
  isFavorite?: boolean;
  sellerId?: string;
}

const formatPrice = (price: number | string | undefined) => {
  if (!price && price !== 0) return "0 kr";
  return Number(price).toLocaleString("nb-NO") + " kr";
};

function ProductCard({
  images = [],
  title = "Uten tittel",
  location = "",
  price = "0",
  id = null,
  isFavorite = false,
  sellerId,
}: ProductCardProps) {

  const siteLink = import.meta.env.VITE_SITE_URL || window.location.origin;
  const user = useAppSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { toggleFavorite, isLoading } = useFavorites();
  const [showModal, setShowModal] = useState(false);

  const handleToggleFavorite = () => {
    if (!id) return;
    toggleFavorite(id, isFavorite);
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
    navigator.clipboard.writeText(`${siteLink}/produkt/${id}`);
    dispatch(uiSliceActions.setFeedbackBanner({ severity: "success", msg: "Lenken ble kopiert" }));
    setShowModal(false);
  };

  return (
    <div className={styles['product-card']}>
      <div className={styles['product-card__image-wrapper']}>
        <Carousel indicators={false} controls={images.length > 1} interval={null}>
          {images.map((img, index) => (
            <Carousel.Item key={index}>
              <Link to={`/produkt/${id}`}>
                <img src={img.location} alt={title} />
              </Link>
            </Carousel.Item>
          ))}
        </Carousel>

        {user?._id !== sellerId && (
          <button
            className={styles['product-card__favorite'] + (isFavorite ? ` ${styles['product-card__favorite--active']}` : '')}
            onClick={handleToggleFavorite}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size="sm" animation="border" style={{ width: 14, height: 14 }} />
            ) : (
              <i className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`} />
            )}
          </button>
        )}

        {images.length > 1 && (
          <span className={styles['product-card__img-count']}>
            <i className="fa-regular fa-image" style={{ marginRight: 4 }} />
            {images.length}
          </span>
        )}
      </div>

      <div className={styles['product-card__content']}>
        <div className={styles['product-card__price']}>{formatPrice(price)}</div>
        <div className={styles['product-card__title']}>{title}</div>
        {location && (
          <div className={styles['product-card__location']}>
            <i className="fa-solid fa-location-dot" />
            {location}
          </div>
        )}
      </div>

      <div className={styles['product-card__actions']}>
        <button className={`${styles['product-card__action-btn']} ${styles['product-card__action-btn--primary']}`} onClick={handleSendMessage}>
          <i className="fa-regular fa-message" style={{ marginRight: 4 }} />
          Melding
        </button>
        <button className={styles['product-card__action-btn']} onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-arrow-up-from-bracket" style={{ marginRight: 4 }} />
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
            value={`${siteLink}/produkt/${id}`}
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

export default ProductCard;
