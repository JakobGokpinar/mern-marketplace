import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useQuery } from "@tanstack/react-query";
import TextareaAutosize from 'react-textarea-autosize';

import styles from './ProductPage.module.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Spinner from "react-bootstrap/Spinner";

import { uiSliceActions } from "../../store/uiSlice";
import { useFavorites } from "../../hooks/useFavorites";
import { instanceAxs } from "../../lib/axios";
import { queryKeys } from "../../lib/queryKeys";
import { format } from "timeago.js";
import type { Product } from "../../types/product";
import type { User } from "../../types/user";

interface ProductPageData {
  product: Product & { isFavorite?: boolean };
  seller: User & { lastActiveAt?: string; userCreatedAt?: string; _id: string };
}

const formatPrice = (price: number | string | undefined) => {
  if (!price && price !== 0) return "0 kr";
  return Number(price).toLocaleString("nb-NO") + " kr";
};

function ProductPage() {
  const { annonceId } = useParams();
  const navigate = useNavigate();
  const siteLink = import.meta.env.VITE_SITE_URL || window.location.origin;

  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();
  const [showShareModal, setShowShareModal] = useState(false);
  const { toggleFavorite, isLoading: isFavLoading } = useFavorites();

  const { data, isPending } = useQuery<ProductPageData>({
    queryKey: queryKeys.products.detail(annonceId ?? ''),
    queryFn: async () => {
      const res = await instanceAxs.get(`/product?id=${annonceId}`);
      return res.data as ProductPageData;
    },
    enabled: !!annonceId,
  });

  const annonce = data?.product;
  const seller = data?.seller;

  const sendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (user?._id === seller?._id || !user || !seller || !annonce) return;
    navigate('/chat', {
      state: {
        buyer: user._id,
        seller: seller._id,
        product_id: annonce._id,
      },
    });
  };

  const copyAnnonceLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigator.clipboard.writeText(`${siteLink}/produkt/${annonceId}`);
    dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: 'Lenken ble kopiert' }));
    setShowShareModal(false);
  };

  if (isPending || !annonce) {
    return (
      <div className={styles['pp__empty']}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <Container className={styles['pp']}>
      <Breadcrumb className={styles['pp__breadcrumb']}>
        <Breadcrumb.Item href="/">Hjem</Breadcrumb.Item>
        <Breadcrumb.Item href={`/search?category=${annonce.category}`}>{annonce.category}</Breadcrumb.Item>
        <Breadcrumb.Item active>{annonce.subCategory}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className={styles['pp__row']}>
        <Col lg={8} className={styles['pp__main']}>
          <div className={styles['pp__carousel-wrapper']}>
            <Carousel variant="dark" className={styles['pp__carousel']}>
              {(annonce.annonceImages || []).map((item, index) => (
                <Carousel.Item key={index}>
                  <img src={item.location} alt={annonce.title} className={styles['pp__carousel-img']} />
                  {item.description && (
                    <Carousel.Caption className={styles['pp__carousel-caption']}>
                      <span>{item.description}</span>
                    </Carousel.Caption>
                  )}
                </Carousel.Item>
              ))}
            </Carousel>
            <div className={styles['pp__img-count']}>
              <i className="fa-regular fa-image" /> {annonce.annonceImages?.length || 0}
            </div>
          </div>

          <div className={styles['pp__price-bar']}>
            <div className={styles['pp__price']}>
              {formatPrice(annonce.price)}
              {annonce.pricePeriod && <span className={styles['pp__price-period']}>{annonce.pricePeriod}</span>}
            </div>
            <div className={styles['pp__actions']}>
              {user?._id !== seller?._id && (
                annonce.isFavorite ? (
                  <button
                    className={`${styles['pp__action-btn']} ${styles['pp__action-btn--fav-active']}`}
                    onClick={() => annonceId && toggleFavorite(annonceId, true)}
                    disabled={isFavLoading}
                  >
                    {isFavLoading ? <Spinner size="sm" /> : <><i className="fa-solid fa-heart" /> Favoritt</>}
                  </button>
                ) : (
                  <button
                    className={styles['pp__action-btn']}
                    onClick={() => annonceId && toggleFavorite(annonceId, false)}
                    disabled={isFavLoading}
                  >
                    {isFavLoading ? <Spinner size="sm" /> : <><i className="fa-regular fa-heart" /> Favoritt</>}
                  </button>
                )
              )}
              <button className={styles['pp__action-btn']} onClick={() => setShowShareModal(true)}>
                <i className="fa-solid fa-arrow-up-from-bracket" /> Del
              </button>
            </div>
          </div>

          <h1 className={styles['pp__title']}>{annonce.title}</h1>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>Beskrivelse</h3>
            <TextareaAutosize className={styles['pp__description']} value={annonce.description} disabled />
          </div>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>N&oslash;kkelinfo</h3>
            <div className={styles['pp__info-grid']}>
              {annonce.status && (
                <div className={styles['pp__info-card']}>
                  <span className={styles['pp__info-label']}>Status</span>
                  <span className={styles['pp__info-value']}>{annonce.status}</span>
                </div>
              )}
              {(annonce.specialProperties || []).map((item, index) => (
                <div key={index} className={styles['pp__info-card']}>
                  <span className={styles['pp__info-label']}>{item.title}</span>
                  <span className={styles['pp__info-value']}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>Adresse</h3>
            <div className={styles['pp__address']}>
              <i className="fa-solid fa-location-dot" />
              <div>
                <p>{annonce.postnumber}</p>
                <p>{annonce.location}</p>
              </div>
            </div>
          </div>
        </Col>

        <Col lg={4} className={styles['pp__sidebar']}>
          <div className={styles['pp__seller-card']}>
            <div className={styles['pp__seller-avatar-wrapper']}>
              {seller?.profilePicture ? (
                <img src={seller.profilePicture} alt={seller?.username} className={styles['pp__seller-avatar']} />
              ) : (
                <div className={`${styles['pp__seller-avatar']} ${styles['pp__seller-avatar--placeholder']}`}>
                  <i className="fa-solid fa-user" />
                </div>
              )}
            </div>
            <p className={styles['pp__seller-name']}>{seller?.username}</p>
            <p className={styles['pp__seller-since']}>Bruker siden {seller?.userCreatedAt ? new Date(seller.userCreatedAt).getFullYear() : ''}</p>
            {seller?.lastActiveAt && (
              <div className={styles['pp__seller-status']}>
                <span className={styles['pp__seller-status--away']}>
                  Sist aktiv {format(seller.lastActiveAt)}
                </span>
              </div>
            )}
            <button className={styles['pp__seller-msg-btn']} onClick={sendMessage}>
              <i className="fa-regular fa-message" /> Send Melding
            </button>
          </div>
        </Col>
      </Row>

      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Del annonsen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control type="text" className="mb-3" value={`${siteLink}/produkt/${annonceId}`} readOnly />
          <Button variant="primary" onClick={copyAnnonceLink}>Kopier Lenken</Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProductPage;
