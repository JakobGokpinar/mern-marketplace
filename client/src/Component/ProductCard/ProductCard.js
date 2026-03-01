import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./ProductCard.css";

import Carousel from 'react-bootstrap/Carousel';
import Spinner from "react-bootstrap/Spinner";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { addToFavorites, removeFromFavorites } from "../../features/userSliceActions";
import { uiSliceActions } from "../../features/uiSlice";

// Format price: 1200000 → "1 200 000 kr"
const formatPrice = (price) => {
  if (!price && price !== 0) return "0 kr";
  return Number(price).toLocaleString("nb-NO") + " kr";
};

function ProductCard(props) {
  const {
    images = [],
    title = "Uten tittel",
    location = "",
    price = "0",
    id = null,
    description = "",
    isFavorite = false,
    user,
    sellerId,
  } = props;

  const siteLink = process.env.REACT_APP_SITE_URL || window.location.origin;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleToggleFavorite = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (isFavorite) {
        dispatch(removeFromFavorites(id));
      } else {
        dispatch(addToFavorites(id));
      }
      setIsLoading(false);
    }, 600);
  };

  const handleSendMessage = (e) => {
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

  const handleCopyLink = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${siteLink}/produkt/${id}`);
    dispatch(
      uiSliceActions.setFeedbackBanner({
        severity: "success",
        msg: "Lenken ble kopiert",
      })
    );
    setShowModal(false);
  };

  return (
    <div
      className="product-card"
    >
      {/* Image Section */}
      <div className="product-card__image-wrapper">
        <Carousel indicators={false} controls={images.length > 1} interval={null}>
          {images.map((img, index) => (
            <Carousel.Item key={index}>
              <Link to={`/produkt/${id}`}>
                <img src={img.location} alt={title} />
              </Link>
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Favorite Button — hidden on own listings */}
        {user?._id !== sellerId && (
          <button
            className={`product-card__favorite ${isFavorite ? "product-card__favorite--active" : ""}`}
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

        {/* Image count */}
        {images.length > 1 && (
          <span className="product-card__img-count">
            <i className="fa-regular fa-image" style={{ marginRight: 4 }} />
            {images.length}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="product-card__content">
        <div className="product-card__price">{formatPrice(price)}</div>
        <div className="product-card__title">{title}</div>
        {location && (
          <div className="product-card__location">
            <i className="fa-solid fa-location-dot" />
            {location}
          </div>
        )}
      </div>

      {/* Actions - visible on hover */}
      <div className="product-card__actions">
        <button className="product-card__action-btn product-card__action-btn--primary" onClick={handleSendMessage}>
          <i className="fa-regular fa-message" style={{ marginRight: 4 }} />
          Melding
        </button>
        <button className="product-card__action-btn" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-arrow-up-from-bracket" style={{ marginRight: 4 }} />
          Del
        </button>
      </div>

      {/* Share Modal */}
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
