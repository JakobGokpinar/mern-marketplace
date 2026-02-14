import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./NewProductCard.css";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { addToFavorites } from "../../features/userSliceActions";
import { removeFromFavorites } from "../../features/userSliceActions";
import { uiSliceActions } from "../../features/uiSlice";

function ProductCard(props) {

  const [images, title, location, price, id, description, isFavorite] = [
    props.images || [ 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'],
    props.title || "no name",
    props.location || "no place",
    props.price || "0",
    props.id || null,
    props.description || '',
    props.isFavorite || false
  ];

  const shortDesc = description.slice(0, 34);
  const siteLink = process.env.REACT_APP_SITE_URL || window.location.origin;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovered, setHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAddToFavorites = () => {
    setIsLoading(true)
    setTimeout(() => {
      dispatch(addToFavorites(id))
      setIsLoading(false)
    }, 1000)
  }

  const handleRemoveFromFavorites = () => {
    setIsLoading(true)
    setTimeout(() => {
      dispatch(removeFromFavorites(id))
      setIsLoading(false)
    }, 1000)
  }

  const setHoveredToTrue = () => {
    setHovered(true)
  }
  const setHoveredToFalse = () => {
    setHovered(false)
  }

  const showShareModal = () => {
    setShowModal(true)
  }
  const closeShareModal = () => {
    setShowModal(false)
  }

  const copyAnnonceLink = (event) => {
    event.preventDefault();
    let text = `${siteLink}/produkt/${id}`;
    navigator.clipboard.writeText(text)
    dispatch(uiSliceActions.setFeedbackBanner({severity: 'success', msg: 'Annons lenken ble kopiert'}));
    setShowModal(false)
  }

  const sendMessageAlert = event => {
    event.preventDefault();
    if(props?.user?._id === props?.sellerId) return;
    navigate('/chat', {   
      state: { 
        buyer: props?.user?._id,  
        seller: props?.sellerId,
        product_id: props?.id
      }})
  }


  return(
    <Card style={{width: '18rem'}} className="card">
        <Card.Body style={{padding: 0, margin: 0}}>

            <Carousel indicators={false} controls={isHovered ? true : false} 
              interval={null} onMouseEnter={setHoveredToTrue} onMouseLeave={setHoveredToFalse}
              >
                  {images.map((img, index) => {
                      return(
                          <Carousel.Item className="carousel-item" key={index}>
                              <Link to={`/produkt/${id}`}>
                                <img
                                  className="carousel-img"
                                  src={img.location}
                                  alt="carousel"
                                />
                            </Link>
                        </Carousel.Item>
                      )
                  })}
              </Carousel>


              <div className="card-properties">
                    <Card.Title className="card-properties__item item-title">{title}</Card.Title>
                    <Card.Subtitle className="card-properties__item item-location ">{location}</Card.Subtitle>
                    <Card.Text className="card-properties__item item-price">{price} nok</Card.Text>
                    <Card.Text className="card-properties__item item-description">
                          {shortDesc}
                    </Card.Text>
              </div>
              
              <div className="card-buttons">
                    {isFavorite ? 
                        <OverlayTrigger placement="bottom" overlay={<Tooltip>Remove from Favorites</Tooltip>}>
                            <Button variant="danger" onClick={handleRemoveFromFavorites}>
                              {isLoading ? <Spinner size='sm'/> : <i className="fa-solid fa-heart"/>}
                            </Button>
                        </OverlayTrigger>
                      :
                        <OverlayTrigger placement="bottom" overlay={<Tooltip>Add to Favorites</Tooltip>}>
                            <Button variant="outline-danger" onClick={handleAddToFavorites}>
                              {isLoading ? <Spinner size='sm'/> : <i className="fa-solid fa-heart"/>}
                            </Button>
                      </OverlayTrigger>
                  }
                  <OverlayTrigger placement="bottom" overlay={<Tooltip>Send en melding til selleren</Tooltip>}>
                      <Button variant="outline-primary" type="button" onClick={sendMessageAlert}> 
                          Send Melding <i className="fa-regular fa-message"/>
                      </Button>
                  </OverlayTrigger>
                  <Button variant="outline-secondary" onClick={showShareModal}>
                      Del <i className="fa-solid fa-arrow-up-from-bracket"/>
                    </Button>
                    <Modal show={showModal} onHide={closeShareModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Del annonsen</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Vil du dele denne annonsen?</p>
                            <Form.Control type="text" className="mb-3" value={`${siteLink}/produkt/${id}`} disabled/>
                            <Button type='button' variant="outline-primary" className="mb-2" onClick={copyAnnonceLink}>
                                Kopier Lenken
                            </Button>
                        </Modal.Body>
                    </Modal>
                </div>
        </Card.Body>
    </Card>
  )
}

export default ProductCard;