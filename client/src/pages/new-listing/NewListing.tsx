import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styles from './NewListing.module.css';

import { compressListingImage } from '../../utils/compressImage';
import { instanceAxs } from '../../lib/axios';
import { useFindCommuneByPostnumber } from '../../hooks/useNorwayGeo';
import { useDebounce } from '../../hooks/useDebounce';
import categoryData from '../../categories.json';
import toast from 'react-hot-toast';
import ListingForm from './ListingForm';
import ListingPreview from './ListingPreview';
import { useFormValidation } from '../../hooks/useFormValidation';
import { listingSchema } from '../../schemas/annonce.schema';
import type { ListingImage, SpecProp, ListingPropertyObject, CategoryItem, SubCategoryItem } from './types';

interface EditListingState {
  annonce: ListingPropertyObject & {
    specialProperties: SpecProp[];
    images: ListingImage[];
  };
}

const isEditListingState = (state: unknown): state is EditListingState =>
  state !== null && typeof state === 'object' && 'annonce' in (state as object);

const EMPTY_LISTING: ListingPropertyObject = {
  title: '', price: '', pricePeriod: '', category: '', subCategory: '',
  subSubCategory: '', description: '', status: '', postnumber: '', location: '',
};

const NewListing = () => {
  const user = useAppSelector(state => state.user.user);
  const communeFinder = useFindCommuneByPostnumber();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [isModifyListing, setIsModifyListing] = useState(false);
  const [listing, setListing] = useState<ListingPropertyObject>(EMPTY_LISTING);
  const [selectedMainCat, setSelectedMainCat] = useState<CategoryItem | ''>('');
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategoryItem | ''>('');
  const [imageArray, setImageArray] = useState<ListingImage[]>([]);
  const [specPropArray, setSpecPropArray] = useState<SpecProp[]>([]);
  const [postAddress, setPostAddress] = useState('');

  const { errors: formErrors, validate } = useFormValidation(listingSchema);
  const debouncedPostnumber = useDebounce(listing.postnumber, 400);

  const buildFormData = async (): Promise<FormData> => {
    const fd = new FormData();
    for (const image of imageArray) {
      if (!image.data) continue;
      const blob = await compressListingImage(image.data);
      const ext = image.name.replace(/.*\./, '');
      const filename = image.name.replace(`.${ext}`, '.jpg');
      fd.append('listingImages', new File([blob], filename, { type: 'image/jpeg' }));
    }
    return fd;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const listingProperties = {
        ...listing,
        price: Number(listing.price),
        specialProperties: specPropArray.filter(item => item.title !== 'Status'),
      };
      const formData = await buildFormData();

      if (isModifyListing) {
        const listingId = listing._id;
        await instanceAxs.delete(`/listings/${listingId}/images`);
        const result = await instanceAxs.post(`/listings/images?listingId=${listingId}`, formData);
        const returnedFiles = result.data.files as Array<{ originalname: string; location: string }>;
        const updatedImages = imageArray.map(img => {
          const jpgName = img.name.replace(/\.[^.]+$/, '.jpg');
          return { ...img, location: returnedFiles.find(f => f.originalname === jpgName)?.location };
        });
        await instanceAxs.put(`/listings/${listingId}`, {
          images: updatedImages,
          listingProperties,
        });
        return 'updated' as const;
      } else {
        const result = await instanceAxs.post('/listings/images', formData);
        if (result.data.message !== 'images uploaded') {
          toast(result.data.message);
          throw new Error(result.data.message);
        }
        const returnedFiles = result.data.files as Array<{ originalname: string; location: string }>;
        const finalImages = imageArray.flatMap(img => {
          const jpgName = img.name.replace(/\.[^.]+$/, '.jpg');
          const match = returnedFiles.find(f => f.originalname === jpgName);
          return match ? [{ ...img, location: match.location }] : [];
        });
        await instanceAxs.post('/listings', {
          listingProperties,
          imageLocations: finalImages,
          listingId: result.data.listingId,
        });
        return 'created' as const;
      }
    },
    onSuccess: (type) => {
      if (type === 'updated') {
        toast.success('Annonsen oppdatert');
        navigate('/my-listings');
      } else {
        toast.success('Annonsen publisert');
        navigate('/');
      }
    },
    onError: () => {
      toast.error('Kunne ikke publisere annonsen. Prøv igjen.');
    },
  });

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'category') {
      const parsed: CategoryItem | '' = JSON.parse(value);
      setSelectedMainCat(parsed);
      setSelectedSubCat('');
      setListing(prev => ({
        ...prev,
        category: parsed ? parsed.maincategory : '',
        subCategory: '',
        subSubCategory: '',
      } as ListingPropertyObject));
      return;
    }

    if (id === 'subCategory') {
      const parsed: SubCategoryItem | '' = JSON.parse(value);
      setSelectedSubCat(parsed);
      setListing(prev => ({
        ...prev,
        subCategory: parsed ? parsed.name : '',
        subSubCategory: '',
      } as ListingPropertyObject));
      return;
    }

    setListing(prev => ({ ...prev, [id]: value } as ListingPropertyObject));
  };

  const handleStatusChange = (value: 'nytt' | 'brukt') => {
    setSpecPropArray(prev => {
      const exists = prev.some(item => item.title === 'Status');
      if (exists) return prev.map(item => item.title === 'Status' ? { ...item, value } : item);
      return [...prev, { title: 'Status', value }];
    });
    setListing(prev => ({ ...prev, status: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const MAX_RAW_SIZE = 15 * 1024 * 1024; // 15 MB raw limit (compressed later)
    Array.from(e.target.files).forEach(file => {
      if (file.size > MAX_RAW_SIZE) {
        toast.error(`${file.name} er for stor (maks 15 MB)`);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        setImageArray(prev => [
          ...prev,
          { name: file.name, data: typeof reader.result === 'string' ? reader.result : undefined, description: '' },
        ]);
      });
    });
  };

  const handleImageDelete = (name: string) => {
    setImageArray(prev => prev.filter(img => img.name !== name));
  };

  const handleImageDescriptionChange = (name: string, description: string) => {
    setImageArray(prev => prev.map(img => img.name === name ? { ...img, description } : img));
  };

  const handleImageReorder = (images: ListingImage[]) => setImageArray(images);

  const handleSpecPropAdd = (title: string, value: string) => {
    const key = title.charAt(0).toUpperCase() + title.slice(1);
    setSpecPropArray(prev => {
      const idx = prev.findIndex(item => item.title === key);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { title: key, value };
        return updated;
      }
      return [...prev, { title: key, value }];
    });
  };

  const handleRemoveSpecProp = (title: string) => {
    setSpecPropArray(prev => prev.filter(item => item.title !== title));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(listing)) return;
    if (imageArray.length === 0) {
      toast.error('Legg til minst ett bilde');
      return;
    }
    submitMutation.mutate();
  };

  useEffect(() => {
    if (!debouncedPostnumber) return;
    const geonamesUser = import.meta.env.VITE_GEONAMES_USER as string;
    fetch(`https://secure.geonames.org/postalCodeLookupJSON?postalcode=${debouncedPostnumber}&country=no&username=${geonamesUser}`)
      .then(r => r.json())
      .then(geoData => {
        const place = geoData.postalcodes[0];
        if (!place) { setPostAddress(''); return; }
        const placeProperties = communeFinder(place.adminCode2);
        if (placeProperties) {
          setListing(prev => ({
            ...prev,
            fylke: placeProperties.fylkesNavn,
            kommune: placeProperties.kommuneNavn,
            location: place.placeName,
          }));
        }
        setPostAddress(place.placeName);
      })
      .catch(() => { setPostAddress(''); });
  }, [debouncedPostnumber, communeFinder]);

  useEffect(() => {
    const state = routerLocation.state;
    if (!isEditListingState(state)) return;
    const stateListing = state.annonce;
    const foundCategory = categoryData.categories.find(item => item.maincategory === stateListing.category);
    const foundSubCat = foundCategory?.subcategories.find(s => s.name === stateListing.subCategory) ?? '';
    setIsModifyListing(true);
    setListing(stateListing);
    setSpecPropArray(stateListing.specialProperties);
    setImageArray(stateListing.images);
    setSelectedMainCat(foundCategory ?? '');
    setSelectedSubCat(foundSubCat);
  // eslint-disable-next-line react-hooks/exhaustive-deps — run once on mount to populate form from router state
  }, []);

  if (!user?.isEmailVerified) {
    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>Verifiser din konto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Verifiser e-postadressen din for å legge ut annonser.</p>
          <a href="/account">
            <Button variant="primary">Gå til min konto</Button>
          </a>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <h1 className={styles['page-title']}>
          {isModifyListing ? 'Endre annonse' : 'Ny annonse'}
        </h1>
        {isModifyListing && (
          <p className={styles['page-subtitle']}>Oppdater informasjonen om produktet ditt</p>
        )}
      </div>

      <Row className={styles['layout-row']}>
        <Col className={styles['form-col']} lg={5} md={6}>
          <ListingForm
            listing={listing}
            selectedMainCat={selectedMainCat}
            selectedSubCat={selectedSubCat}
            imageArray={imageArray}
            isModifyListing={isModifyListing}
            isPublishing={submitMutation.isPending}
            errors={formErrors}
            onPropertyChange={handlePropertyChange}
            onStatusChange={handleStatusChange}
            onImageChange={handleImageChange}
            onImageDelete={handleImageDelete}
            onImageDescriptionChange={handleImageDescriptionChange}
            onImageReorder={handleImageReorder}
            onSpecPropAdd={handleSpecPropAdd}
            onSubmit={handleSubmit}
            onCancel={() => navigate(isModifyListing ? '/my-listings' : '/')}
            postAddress={postAddress}
          />
        </Col>
        <Col lg={7} md={6} className={styles['preview-col']}>
          <div className={styles['preview-sticky']}>
            <ListingPreview
              listing={listing}
              selectedMainCat={selectedMainCat}
              imageArray={imageArray}
              specPropArray={specPropArray}
              postNumber={listing.postnumber}
              postAddress={postAddress}
              onRemoveSpecProp={handleRemoveSpecProp}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default NewListing;
