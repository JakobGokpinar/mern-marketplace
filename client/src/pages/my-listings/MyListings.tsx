import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './MyListings.module.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { removeListingApi } from '../../services/profileService';
import { fetchMyProductsApi } from '../../services/productService';
import { queryKeys } from '../../lib/queryKeys';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';

const MyListings = () => {
  const navigate = useNavigate();
  const queryClientHook = useQueryClient();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const { data: listingArray = [], isPending } = useQuery({
    queryKey: queryKeys.products.mine(),
    queryFn: fetchMyProductsApi,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeListingApi(id),
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClientHook.invalidateQueries({ queryKey: queryKeys.products.mine() });
      setShowRemoveModal(false);
    },
    onError: () => toast.error('Kunne ikke slette annonsen'),
  });

  const deleteListing = () => {
    if (selectedItem) removeMutation.mutate(selectedItem._id);
  };

  return (
    <div className={styles['mylistings-container']}>
      <h1 className={styles['mylistings-heading']}>Mine Annonser</h1>

      {isPending ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : listingArray.length > 0 ? (
        <div className={styles['mylistings-content']}>
          {listingArray.map((item) => (
            <div key={item._id} className={styles['mylistings-item']}>
              <img src={item.images?.[0]?.location} className={styles['item-img']} alt={item.title} />
              <div className={styles['item-info']}>
                <p className={styles['item-title']}>{item.title}</p>
                <p className={styles['item-price']}>{item.price} kr</p>
                <div className={styles['item-buttons']}>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/new-listing', { state: { annonce: item } })}>
                    Endre
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => { setSelectedItem(item); setShowRemoveModal(true); }}>
                    Fjern
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles['mylistings-empty']}>
          <p>Du har ingen aktive annonser ennå. <a href="/new-listing">Legg ut en annonse</a></p>
        </div>
      )}

      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Fjern Annonsen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Du er i ferd med å slette denne annonsen. Er du sikker?</p>
          <Form.Control value={selectedItem?.title || ''} disabled />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={deleteListing} disabled={removeMutation.isPending}>
            {removeMutation.isPending ? <Spinner size="sm" /> : 'Ja, Fjern Annonsen'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyListings;
