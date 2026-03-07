import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from 'react-hot-toast';
import { useAppSelector } from "../../store/hooks";
import { useQuery } from "@tanstack/react-query";

import styles from './ListingPage.module.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Spinner from "react-bootstrap/Spinner";

import { useFavorites } from "../../hooks/useFavorites";
import { instanceAxs } from "../../lib/axios";
import { queryKeys } from "../../lib/queryKeys";
import { timeago } from "../../utils/timeago";
import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types/product";
import type { User } from "../../types/user";
import Icon from '../../components/icons/Icon';

interface ProductPageData {
  product: Product & { isFavorite?: boolean };
  seller: User & { lastActiveAt?: string; userCreatedAt?: string; _id: string };
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const siteLink = import.meta.env.VITE_SITE_URL || window.location.origin;

  const user = useAppSelector(state => state.user.user);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toggleFavorite, isLoading: isFavLoading } = useFavorites();

  const { data, isPending } = useQuery<ProductPageData>({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: async () => {
      const res = await instanceAxs.get(`/listings/${id}`);
      return res.data as ProductPageData;
    },
    enabled: !!id,
  });

  const listing = data?.product;
  const seller = data?.seller;

  const sendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (user?._id === seller?._id || !user || !seller || !listing) return;
    navigate('/chat', {
      state: {
        buyer: user._id,
        seller: seller._id,
        product_id: listing._id,
      },
    });
  };

  const copyListingLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigator.clipboard.writeText(`${siteLink}/l/${id}`);
    toast.success('Lenken ble kopiert');
    setShowShareModal(false);
  };

  if (isPending || !listing) {
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
        <Breadcrumb.Item href={`/search?category=${listing.category}`}>{listing.category}</Breadcrumb.Item>
        <Breadcrumb.Item active>{listing.subCategory}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className={styles['pp__row']}>
        <Col lg={8} className={styles['pp__main']}>
          <div className={styles['pp__carousel-wrapper']}>
            <Carousel variant="dark" className={styles['pp__carousel']}>
              {(listing.images || []).map((item) => (
                <Carousel.Item key={item.location}>
                  <img src={item.location} alt={listing.title} className={styles['pp__carousel-img']} loading="lazy" />
                  {item.description && (
                    <Carousel.Caption className={styles['pp__carousel-caption']}>
                      <span>{item.description}</span>
                    </Carousel.Caption>
                  )}
                </Carousel.Item>
              ))}
            </Carousel>
            <div className={styles['pp__img-count']}>
              <Icon name="image-outline" /> {listing.images?.length || 0}
            </div>
          </div>

          <div className={styles['pp__price-bar']}>
            <div className={styles['pp__price']}>
              {formatPrice(listing.price)}
              {listing.pricePeriod && <span className={styles['pp__price-period']}>{listing.pricePeriod}</span>}
            </div>
            <div className={styles['pp__actions']}>
              {user?._id !== seller?._id && (
                listing.isFavorite ? (
                  <button
                    className={`${styles['pp__action-btn']} ${styles['pp__action-btn--fav-active']}`}
                    onClick={() => id && toggleFavorite(id, true)}
                    disabled={isFavLoading}
                  >
                    {isFavLoading ? <Spinner size="sm" /> : <><Icon name="heart" /> Favoritt</>}
                  </button>
                ) : (
                  <button
                    className={styles['pp__action-btn']}
                    onClick={() => id && toggleFavorite(id, false)}
                    disabled={isFavLoading}
                  >
                    {isFavLoading ? <Spinner size="sm" /> : <><Icon name="heart-outline" /> Favoritt</>}
                  </button>
                )
              )}
              <button className={styles['pp__action-btn']} onClick={() => setShowShareModal(true)}>
                <Icon name="arrow-up-from-bracket" /> Del
              </button>
            </div>
          </div>

          <h1 className={styles['pp__title']}>{listing.title}</h1>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>Beskrivelse</h3>
            <p className={styles['pp__description']}>{listing.description}</p>
          </div>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>N&oslash;kkelinfo</h3>
            <div className={styles['pp__info-grid']}>
              {listing.status && (
                <div className={styles['pp__info-card']}>
                  <span className={styles['pp__info-label']}>Status</span>
                  <span className={styles['pp__info-value']}>{listing.status}</span>
                </div>
              )}
              {(listing.specialProperties || []).map((item) => (
                <div key={item.title} className={styles['pp__info-card']}>
                  <span className={styles['pp__info-label']}>{item.title}</span>
                  <span className={styles['pp__info-value']}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles['pp__section']}>
            <h3 className={styles['pp__section-title']}>Lokasjon</h3>
            <div className={styles['pp__location-card']}>
              <div className={styles['pp__location-icon']}>
                <Icon name="location-dot" />
              </div>
              <div>
                <p className={styles['pp__location-place']}>{listing.location}</p>
                <p className={styles['pp__location-post']}>{listing.postnumber}</p>
              </div>
            </div>
          </div>
        </Col>

        <Col lg={4} className={styles['pp__sidebar']}>
          <div className={styles['pp__seller-card']}>
            <div className={styles['pp__seller-avatar-wrapper']}>
              {seller?.profilePicture ? (
                <img src={seller.profilePicture} alt={seller?.fullName} className={styles['pp__seller-avatar']} loading="lazy" />
              ) : (
                <div className={`${styles['pp__seller-avatar']} ${styles['pp__seller-avatar--placeholder']}`}>
                  <Icon name="user" />
                </div>
              )}
            </div>
            <p className={styles['pp__seller-name']}>{seller?.fullName}</p>
            <p className={styles['pp__seller-since']}>Bruker siden {seller?.userCreatedAt ? new Date(seller.userCreatedAt).getFullYear() : ''}</p>
            {seller?.lastActiveAt && (
              <div className={styles['pp__seller-status']}>
                <span className={styles['pp__seller-status--away']}>
                  Sist aktiv {timeago(seller.lastActiveAt)}
                </span>
              </div>
            )}
            <button className={styles['pp__seller-msg-btn']} onClick={sendMessage}>
              <Icon name="message-outline" /> Send Melding
            </button>
          </div>
        </Col>
      </Row>

      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Del annonsen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control type="text" className="mb-3" value={`${siteLink}/l/${id}`} readOnly />
          <Button variant="primary" onClick={copyListingLink}>Kopier Lenken</Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProductPage;
