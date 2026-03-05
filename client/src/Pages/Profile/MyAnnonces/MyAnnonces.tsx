import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from './MyAnnonces.module.css';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { removeListingApi } from '../../../services/profileService';
import { fetchMyProductsApi } from '../../../services/productService';
import { queryKeys } from '../../../lib/queryKeys';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../types/product';

const MyListings = () => {
  const navigate = useNavigate();
  const queryClientHook = useQueryClient();
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const { data: listingArray = [], isPending } = useQuery({
    queryKey: queryKeys.products.mine(),
    queryFn: async () => {
      const products = await fetchMyProductsApi();
      return products;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeListingApi(id),
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClientHook.invalidateQueries({ queryKey: queryKeys.products.mine() });
      setShowRemoveModal(false);
    },
    onError: () => {
      toast.error('Kunne ikke slette annonsen');
    },
  });

  const visibleRemoveModal = (e: React.MouseEvent<HTMLButtonElement>, item: Product) => {
    e.preventDefault();
    setSelectedItem(item);
    setShowRemoveModal(true);
  };

  const makeChangeModalVisible = (e: React.MouseEvent<HTMLButtonElement>, item: Product) => {
    e.preventDefault();
    navigate('/new-listing', { state: { annonce: item } });
  };

  const deleteListing = () => {
    if (selectedItem) removeMutation.mutate(selectedItem._id);
  };

  return (
    <div className={styles['myannonces-container']}>
      <Breadcrumb>
        <Breadcrumb.Item href='/min-konto'>Min konto</Breadcrumb.Item>
        <Breadcrumb.Item href='/my-listings' active>Mine Annonser</Breadcrumb.Item>
      </Breadcrumb>

      {isPending ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : listingArray.length > 0 ? (
        <div className={styles['myannonces-content']}>
          {listingArray.map((item) => (
            <div key={item._id} className={`${styles['myannonces-content-product']} border`}>
              <img src={item.images?.[0]?.location} className={styles['content-product-img']} alt={item.title} />
              <div className={styles['content-product-info']}>
                <p className={styles['content-product-info-title']}>{item.title}</p>
                <p className={`${styles['content-product-info-price']} mt-2`}>{item.price} kr</p>
                <div className={styles['content-product-info-buttons']}>
                  <Button className={styles['content-product-control-button']} variant='outline-primary' size='sm' onClick={e => makeChangeModalVisible(e, item)}>Endre</Button>
                  <Button className={styles['content-product-control-button']} variant='outline-danger' size='sm' onClick={e => visibleRemoveModal(e, item)}>Fjern</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles['myannonces-content']}>
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
