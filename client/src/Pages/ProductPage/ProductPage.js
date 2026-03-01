import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import TextareaAutosize from 'react-textarea-autosize';

import { instanceAxs } from "../../config/api.js";
import './ProductPage.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Spinner from "react-bootstrap/Spinner";

import { uiSliceActions } from "../../features/uiSlice.js";
import { addToFavorites, removeFromFavorites } from "../../features/userSliceActions.js";
import { format } from "timeago.js";

const formatPrice = (price) => {
    if (!price && price !== 0) return "0 kr";
    return Number(price).toLocaleString("nb-NO") + " kr";
};

function ProductPage() {
    let { annonceId } = useParams();
    let navigate = useNavigate();
    const siteLink = process.env.REACT_APP_SITE_URL || window.location.origin;
    
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const [annonce, setAnnonce] = useState('');
    const [seller, setSeller] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const findProduct = useCallback(async () => {
        await instanceAxs.get(`/product?id=${annonceId}`)
            .then(respond => {
                if (respond.status !== 200) {
                    setLoading(false);
                    return;
                }
                setAnnonce(respond.data.product);
                setSeller(respond.data.seller);
            })
            .catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    
    const sendMessage = (event) => {
        event.preventDefault();
        if (user?._id === seller?._id || !user || !seller || !annonce) return;
        navigate('/chat', {   
            state: { 
                buyer: user._id,  
                seller: seller._id,
                product_id: annonce._id
            }
        });
    };

    const handleAddToFavorites = () => {
        setShowSpinner(true);
        setTimeout(() => {
            dispatch(addToFavorites(annonceId));
            setShowSpinner(false);
        }, 800);
    };
    
    const handleRemoveFromFavorites = () => {
        setShowSpinner(true);
        setTimeout(() => {
            dispatch(removeFromFavorites(annonceId));
            setShowSpinner(false);
        }, 800);
    };

    const copyAnnonceLink = (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(`${siteLink}/produkt/${annonceId}`);
        dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: 'Lenken ble kopiert' }));
        setShowShareModal(false);
    };

    useEffect(() => {
        findProduct();
        //eslint-disable-next-line
    }, [isLoading]);

    useEffect(() => {
        findProduct();
    }, [findProduct]);

    if (annonce === '') {
        return (
            <div className="pp-empty">
                <Spinner animation="border" variant="secondary" />
            </div>
        );
    }

    return (
        <Container className="pp">
            <Breadcrumb className="pp__breadcrumb">
                <Breadcrumb.Item href="/">Hjem</Breadcrumb.Item>
                <Breadcrumb.Item href={`/search?category=${annonce.category}`}>{annonce.category}</Breadcrumb.Item>
                <Breadcrumb.Item active>{annonce.subCategory}</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="pp__row">
                {/* Left Column - Product Details */}
                <Col lg={8} className="pp__main">
                    {/* Image Carousel */}
                    <div className="pp__carousel-wrapper">
                        <Carousel variant="dark" className="pp__carousel">
                            {(annonce.annonceImages || []).map((item, index) => (
                                <Carousel.Item key={index}>
                                    <img src={item.location} alt={annonce.title} className="pp__carousel-img" />
                                    {item.description && (
                                        <Carousel.Caption className="pp__carousel-caption">
                                            <span>{item.description}</span>
                                        </Carousel.Caption>
                                    )}
                                </Carousel.Item>
                            ))}
                        </Carousel>
                        <div className="pp__img-count">
                            <i className="fa-regular fa-image" /> {annonce.annonceImages?.length || 0}
                        </div>
                    </div>

                    {/* Price + Actions Bar */}
                    <div className="pp__price-bar">
                        <div className="pp__price">
                            {formatPrice(annonce.price)}
                            {annonce.pricePeriod && <span className="pp__price-period">{annonce.pricePeriod}</span>}
                        </div>
                        <div className="pp__actions">
                            {user?._id !== seller?._id && (
                                annonce.isFavorite ? (
                                    <button className="pp__action-btn pp__action-btn--fav-active" onClick={handleRemoveFromFavorites}>
                                        {showSpinner ? <Spinner size="sm" /> : <><i className="fa-solid fa-heart" /> Favoritt</>}
                                    </button>
                                ) : (
                                    <button className="pp__action-btn" onClick={handleAddToFavorites}>
                                        {showSpinner ? <Spinner size="sm" /> : <><i className="fa-regular fa-heart" /> Favoritt</>}
                                    </button>
                                )
                            )}
                            <button className="pp__action-btn" onClick={() => setShowShareModal(true)}>
                                <i className="fa-solid fa-arrow-up-from-bracket" /> Del
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="pp__title">{annonce.title}</h1>

                    {/* Description */}
                    <div className="pp__section">
                        <h3 className="pp__section-title">Beskrivelse</h3>
                        <TextareaAutosize className="pp__description" value={annonce.description} disabled />
                    </div>

                    {/* Key Info */}
                    <div className="pp__section">
                        <h3 className="pp__section-title">N&oslash;kkelinfo</h3>
                        <div className="pp__info-grid">
                            {annonce.status && (
                                <div className="pp__info-card">
                                    <span className="pp__info-label">Status</span>
                                    <span className="pp__info-value">{annonce.status}</span>
                                </div>
                            )}
                            {annonce.specialProperties.map((item, index) => (
                                <div key={index} className="pp__info-card">
                                    <span className="pp__info-label">{item.title}</span>
                                    <span className="pp__info-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="pp__section">
                        <h3 className="pp__section-title">Adresse</h3>
                        <div className="pp__address">
                            <i className="fa-solid fa-location-dot" />
                            <div>
                                <p>{annonce.postnumber}</p>
                                <p>{annonce.location}</p>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Right Column - Seller */}
                <Col lg={4} className="pp__sidebar">
                    <div className="pp__seller-card">
                        <div className="pp__seller-avatar-wrapper">
                            {seller?.profilePicture ? (
                                <img src={seller.profilePicture} alt={seller?.username} className="pp__seller-avatar" />
                            ) : (
                                <div className="pp__seller-avatar pp__seller-avatar--placeholder">
                                    <i className="fa-solid fa-user" />
                                </div>
                            )}
                        </div>
                        <p className="pp__seller-name">{seller?.username}</p>
                        <p className="pp__seller-since">Bruker siden {new Date(seller?.userCreatedAt).getFullYear()}</p>
                        {seller?.lastActiveAt && (
                            <div className="pp__seller-status">
                                <span className="pp__seller-status--away">
                                    Sist aktiv {format(seller.lastActiveAt)}
                                </span>
                            </div>
                        )}
                        <button className="pp__seller-msg-btn" onClick={sendMessage}>
                            <i className="fa-regular fa-message" /> Send Melding
                        </button>
                    </div>
                </Col>
            </Row>

            {/* Share Modal */}
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
