import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styles from './NewAnnonce.module.css';

import { getCroppedImage } from '../../utils/cropImage';
import { dataURLtoFile } from '../../utils/dataURltoFile';
import { instanceAxs } from '../../lib/axios';
import { useFindCommuneByPostnumber } from '../../hooks/useNorwayGeo';
import { useDebounce } from '../../hooks/useDebounce';
import categoryData from '../../categories.json';
import toast from 'react-hot-toast';
import AnnonceForm from './AnnonceForm';
import AnnoncePreview from './AnnoncePreview';
import { useFormValidation } from '../../hooks/useFormValidation';
import { annonceSchema } from '../../schemas/annonce.schema';
import type { AnnonceImage, SpecProp, AnnoncePropertyObject, CategoryItem, SubCategoryItem } from './types';

interface EditAnnonceState {
  annonce: AnnoncePropertyObject & {
    specialProperties: SpecProp[];
    annonceImages: AnnonceImage[];
  };
}

const isEditAnnonceState = (state: unknown): state is EditAnnonceState =>
  state !== null && typeof state === 'object' && 'annonce' in (state as object);

const EMPTY_ANNONCE: AnnoncePropertyObject = {
  title: '', price: '', pricePeriod: '', category: '', subCategory: '',
  subSubCategory: '', description: '', status: '', postnumber: '', location: '',
};

const NewAnnonce = () => {
  const user = useAppSelector(state => state.user.user);
  const communeFinder = useFindCommuneByPostnumber();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [isModifyAnnonce, setIsModifyAnnonce] = useState(false);
  const [annonce, setAnnonce] = useState<AnnoncePropertyObject>(EMPTY_ANNONCE);
  const [selectedMainCat, setSelectedMainCat] = useState<CategoryItem | ''>('');
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategoryItem | ''>('');
  const [imageArray, setImageArray] = useState<AnnonceImage[]>([]);
  const [specPropArray, setSpecPropArray] = useState<SpecProp[]>([]);
  const [postAddress, setPostAddress] = useState('');

  const { errors: formErrors, validate } = useFormValidation(annonceSchema);
  const debouncedPostnumber = useDebounce(annonce.postnumber, 400);

  const buildFormData = async (): Promise<FormData> => {
    const fd = new FormData();
    for (const image of imageArray) {
      if (!image.data) continue;
      const canvas = await getCroppedImage(image.data);
      fd.append('annonceImages', dataURLtoFile(canvas.toDataURL('image/jpeg'), image.name));
    }
    return fd;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const annonceProperties = {
        ...annonce,
        specialProperties: specPropArray.filter(item => item.title !== 'Status'),
      };
      const formData = await buildFormData();

      if (isModifyAnnonce) {
        const annonceId = annonce._id;
        await instanceAxs.post('/newannonce/remove/annonceimages', { annonceId });
        const result = await instanceAxs.post(`/newannonce/imageupload?annonceid=${annonceId}`, formData);
        const returnedFiles = result.data.files as Array<{ originalname: string; location: string }>;
        const updatedImages = imageArray.map(img => ({
          ...img,
          location: returnedFiles.find(f => f.originalname === img.name)?.location,
        }));
        await instanceAxs.post('/newannonce/update', {
          annonceImages: updatedImages,
          annonceproperties: annonceProperties,
          annonceId,
        });
        return 'updated' as const;
      } else {
        const result = await instanceAxs.post('/newannonce/imageupload', formData);
        if (result.data.message !== 'images uploaded') {
          toast(result.data.message);
          throw new Error(result.data.message);
        }
        const returnedFiles = result.data.files as Array<{ originalname: string; location: string }>;
        const finalImages = imageArray.flatMap(img => {
          const match = returnedFiles.find(f => f.originalname === img.name);
          return match ? [{ ...img, location: match.location }] : [];
        });
        await instanceAxs.post('/newannonce/create', {
          annonceproperties: annonceProperties,
          imagelocations: finalImages,
          annonceid: result.data.annonceId,
        });
        return 'created' as const;
      }
    },
    onSuccess: (type) => {
      if (type === 'updated') {
        toast.success('Annonsen ble oppdatert');
        navigate('/mine-annonser');
      } else {
        toast.success('Annonsen ble publisert');
        navigate('/');
      }
    },
    onError: () => {
      toast.error('Annonsen kunne ikke publiseres akkurat nå. Vennligst prøv igjen senere.');
    },
  });

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'category') {
      const parsed: CategoryItem | '' = JSON.parse(value);
      setSelectedMainCat(parsed);
      setSelectedSubCat('');
      setAnnonce(prev => ({
        ...prev,
        category: parsed ? parsed.maincategory : '',
        subCategory: '',
        subSubCategory: '',
      } as AnnoncePropertyObject));
      return;
    }

    if (id === 'subCategory') {
      const parsed: SubCategoryItem | '' = JSON.parse(value);
      setSelectedSubCat(parsed);
      setAnnonce(prev => ({
        ...prev,
        subCategory: parsed ? parsed.name : '',
        subSubCategory: '',
      } as AnnoncePropertyObject));
      return;
    }

    setAnnonce(prev => ({ ...prev, [id]: value } as AnnoncePropertyObject));
  };

  const handleStatusChange = (value: 'nytt' | 'brukt') => {
    setSpecPropArray(prev => {
      const exists = prev.some(item => item.title === 'Status');
      if (exists) return prev.map(item => item.title === 'Status' ? { ...item, value } : item);
      return [...prev, { title: 'Status', value }];
    });
    setAnnonce(prev => ({ ...prev, status: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
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

  const handleImageReorder = (images: AnnonceImage[]) => setImageArray(images);

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
    if (!validate(annonce)) return;
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
          setAnnonce(prev => ({
            ...prev,
            fylke: placeProperties.fylkesNavn,
            kommune: placeProperties.kommuneNavn,
            location: place.placeName,
          }));
        }
        setPostAddress(place.placeName);
      })
      .catch(() => {});
  }, [debouncedPostnumber, communeFinder]);

  useEffect(() => {
    const state = routerLocation.state;
    if (!isEditAnnonceState(state)) return;
    const stateAnnonce = state.annonce;
    const foundCategory = categoryData.categories.find(item => item.maincategory === stateAnnonce.category);
    const foundSubCat = foundCategory?.subcategories.find(s => s.name === stateAnnonce.subCategory) ?? '';
    setIsModifyAnnonce(true);
    setAnnonce(stateAnnonce);
    setSpecPropArray(stateAnnonce.specialProperties);
    setImageArray(stateAnnonce.annonceImages);
    setSelectedMainCat(foundCategory ?? '');
    setSelectedSubCat(foundSubCat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user?.isEmailVerified) {
    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>Verifiser din e-post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Du må verifisere e-postadressen din før du kan legge ut en annonse.</p>
          <a href="/profil">
            <Button variant="primary">Gå til min profil</Button>
          </a>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <h1 className={styles['page-title']}>
          {isModifyAnnonce ? 'Endre annonse' : 'Ny annonse'}
        </h1>
        {isModifyAnnonce && (
          <p className={styles['page-subtitle']}>Oppdater informasjonen om produktet ditt</p>
        )}
      </div>

      <Row className={styles['layout-row']}>
        <Col className={styles['form-col']} lg={5} md={6}>
          <AnnonceForm
            annonce={annonce}
            selectedMainCat={selectedMainCat}
            selectedSubCat={selectedSubCat}
            imageArray={imageArray}
            isModifyAnnonce={isModifyAnnonce}
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
            onCancel={() => navigate(isModifyAnnonce ? '/mine-annonser' : '/')}
            postAddress={postAddress}
          />
        </Col>
        <Col lg={7} md={6} className={styles['preview-col']}>
          <div className={styles['preview-sticky']}>
            <AnnoncePreview
              annonce={annonce}
              selectedMainCat={selectedMainCat}
              imageArray={imageArray}
              specPropArray={specPropArray}
              postNumber={annonce.postnumber}
              postAddress={postAddress}
              onRemoveSpecProp={handleRemoveSpecProp}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default NewAnnonce;
