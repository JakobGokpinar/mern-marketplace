import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import './MyAnnonces.css';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { removeAnnonce, fetchUser } from '../../../features/userSliceActions';
import { useNavigate } from 'react-router-dom';

const MyAnnonces = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.user.user);
    const [annonceArray, setAnnonceArray] = useState(user.annonces);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showChangeModal, setChangeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');

    const visibleRemoveModal = (e,item) => {
        e.preventDefault();
        setSelectedItem(item);
        setShowRemoveModal(true)
    }

    const makeChangeModalVisible = (e, item) => {
        e.preventDefault();
        navigate('/nyannonse', {state: {annonce: item}})
    }

    const deleteAnnonce = () => {
        dispatch(removeAnnonce(selectedItem._id));
        setTimeout(() => {
            dispatch(fetchUser());
        }, 1000);
        setShowRemoveModal(false);
    }

    useEffect(() => {
        setAnnonceArray(user.annonces)
    }, [user])
    
        return(
            <div className='myannonces-container'>
                <Breadcrumb>
                    <Breadcrumb.Item href='/min-konto'>Min konto</Breadcrumb.Item>
                    <Breadcrumb.Item href='/mine-annonser' active>Mine Annonser</Breadcrumb.Item>
                </Breadcrumb>
                {(annonceArray && annonceArray.length > 0) ?
                    <div className='myannonces-content'>
                        {(annonceArray && annonceArray.length > 0) && annonceArray.map((item, index) => {
                            return(
                                <div key={index} className='myannonces-content-product border'>
                                    <img src={item.annonceImages[0].location} className='content-product__img' alt='gg'/>
                                    <div className='content-product__info'>
                                        <p className='content-product__info__title'>{item.title}</p>
                                        <p className='content-product__info__price mt-2'>{item.price} kr</p>
                                        <div className='content-product__info__buttons'>
                                            <Button className='content-product-control-button'variant='outline-primary' size='sm' onClick={e => makeChangeModalVisible(e, item)}>Endre</Button>
                                            <Button className='content-product-control-button' variant='outline-danger' size='sm'onClick={e => visibleRemoveModal(e, item)}>Fjern</Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                :
                    <div className='myannonces-content'>
                        <p>Du har ingen aktive annonser nå. Prøv å logge inn og legge ut annonser</p>
                    </div>

                    
                }
                <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Fjern Annonsen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Du er i ferd med å slette denne annonsen. Er du sikker?</p>
                        <Form.Control value={selectedItem.title} disabled></Form.Control>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={deleteAnnonce}>Ja, Fjern Annonsen</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showChangeModal} onHide={() => setChangeModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Endre Annonsen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='outline-primary'>Lukk</Button>
                        <Button variant='primary'>Lagre</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    
}

export default MyAnnonces;