import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../store/hooks';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import toast from 'react-hot-toast';
import styles from '../new-listing/NewListing.module.css';

import { compressListingImage } from '../../utils/compressImage';
import { instanceAxs } from '../../lib/axios';
import { useDebounce } from '../../hooks/useDebounce';
import { queryKeys } from '../../lib/queryKeys';
import { fetchListingApi } from '../../services/productService';
import categoryData from '../../categories.json';
import ListingForm from '../new-listing/ListingForm';
import ListingPreview from '../new-listing/ListingPreview';
import { useFormValidation } from '../../hooks/useFormValidation';
import { listingSchema } from '../../schemas/annonce.schema';
import type { ListingImage, SpecProp, ListingPropertyObject, CategoryItem, SubCategoryItem } from '../new-listing/types';

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [listing, setListing] = useState<ListingPropertyObject>({
    title: '', price: '', pricePeriod: '', category: '', subCategory: '',
    subSubCategory: '', description: '', status: '', postnumber: '', location: '',
  });
  const [selectedMainCat, setSelectedMainCat] = useState<CategoryItem | ''>('');
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategoryItem | ''>('');
  const [imageArray, setImageArray] = useState<ListingImage[]>([]);
  const [specPropArray, setSpecPropArray] = useState<SpecProp[]>([]);
  const [postAddress, setPostAddress] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { errors: formErrors, validate, setFieldError } = useFormValidation(listingSchema);
  const debouncedPostnumber = useDebounce(listing.postnumber, 400);

  const { data: fetchedListing, isPending, isError } = useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => fetchListingApi(id!),
    enabled: !!id,
  });

  // Populate form when listing data arrives
  useEffect(() => {
    if (!fetchedListing || initialized) return;
    const foundCategory = categoryData.categories.find(item => item.maincategory === fetchedListing.category);
    const foundSubCat = foundCategory?.subcategories.find(s => s.name === fetchedListing.subCategory) ?? '';

    setListing({
      _id: fetchedListing._id,
      title: fetchedListing.title,
      price: String(fetchedListing.price),
      pricePeriod: fetchedListing.pricePeriod || '',
      category: fetchedListing.category,
      subCategory: fetchedListing.subCategory,
      subSubCategory: fetchedListing.subSubCategory || '',
      description: fetchedListing.description,
      status: fetchedListing.status || '',
      postnumber: fetchedListing.postnumber || '',
      location: fetchedListing.location || '',
      kommune: fetchedListing.kommune,
    });
    setSpecPropArray(fetchedListing.specialProperties || []);
    setImageArray((fetchedListing.images || []).map((img, i) => ({
      id: crypto.randomUUID(),
      name: img.name || `image-${i}.jpg`,
      location: img.location,
      description: img.description || '',
    })));
    setSelectedMainCat(foundCategory ?? '');
    setSelectedSubCat(foundSubCat);
    setPostAddress(fetchedListing.location || '');
    setInitialized(true);
  }, [fetchedListing, initialized]);

  // Postnumber lookup
  useEffect(() => {
    if (!initialized) return;
    if (!debouncedPostnumber || !/^\d{4}$/.test(debouncedPostnumber)) {
      setPostAddress('');
      setListing(prev => ({ ...prev, location: '', kommune: '' }));
      return;
    }
    fetch(`https://ws.geonorge.no/adresser/v1/sok?postnummer=${debouncedPostnumber}&treffPerSide=1`)
      .then(r => r.json())
      .then(data => {
        const hit = data.adresser?.[0];
        if (!hit) {
          setPostAddress('');
          setListing(prev => ({ ...prev, location: '', kommune: '' }));
          return;
        }
        setListing(prev => ({ ...prev, location: hit.poststed, kommune: hit.kommunenavn }));
        setPostAddress(hit.poststed);
      })
      .catch(() => {
        setPostAddress('');
        setListing(prev => ({ ...prev, location: '', kommune: '' }));
      });
  }, [debouncedPostnumber, initialized]);

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

  const updateMutation = useMutation({
    mutationFn: async () => {
      const listingId = listing._id;
      const { _id, ...rest } = listing;
      const listingProperties = {
        ...rest,
        price: Number(listing.price),
        specialProperties: specPropArray.filter(item => item.title !== 'Status'),
      };

      const newImages = imageArray.filter(img => img.data);
      let returnedFiles: Array<{ originalname: string; location: string }> = [];
      if (newImages.length > 0) {
        const formData = await buildFormData();
        const result = await instanceAxs.post(`/listings/images?listingId=${listingId}`, formData);
        returnedFiles = result.data.files as Array<{ originalname: string; location: string }>;
      }

      const updatedImages = imageArray.map(img => {
        if (!img.data) return { name: img.name, location: img.location, description: img.description };
        const jpgName = img.name.replace(/\.[^.]+$/, '.jpg');
        return { name: img.name, location: returnedFiles.find(f => f.originalname === jpgName)?.location, description: img.description };
      });

      await instanceAxs.put(`/listings/${_id}`, {
        images: updatedImages,
        listingProperties,
      });
    },
    onSuccess: () => {
      toast.success('Annonsen oppdatert');
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id ?? '') });
      navigate('/my-listings');
    },
    onError: () => {
      toast.error('Kunne ikke oppdatere annonsen');
    },
  });

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id: fieldId, value } = e.target;

    if (fieldId === 'category') {
      const parsed: CategoryItem | '' = JSON.parse(value);
      setSelectedMainCat(parsed);
      setSelectedSubCat('');
      setListing(prev => ({ ...prev, category: parsed ? parsed.maincategory : '', subCategory: '', subSubCategory: '' } as ListingPropertyObject));
      return;
    }
    if (fieldId === 'subCategory') {
      const parsed: SubCategoryItem | '' = JSON.parse(value);
      setSelectedSubCat(parsed);
      setListing(prev => ({ ...prev, subCategory: parsed ? parsed.name : '', subSubCategory: '' } as ListingPropertyObject));
      return;
    }
    setListing(prev => ({ ...prev, [fieldId]: value } as ListingPropertyObject));
  };

  const handleStatusChange = (value: 'nytt' | 'brukt') => {
    setSpecPropArray(prev => {
      const exists = prev.some(item => item.title === 'Status');
      if (exists) return prev.map(item => item.title === 'Status' ? { ...item, value } : item);
      return [...prev, { title: 'Status', value }];
    });
    setListing(prev => ({ ...prev, status: value }));
  };

  const MAX_IMAGES = 25;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const MAX_RAW_SIZE = 15 * 1024 * 1024;
    const remaining = MAX_IMAGES - imageArray.length;
    const files = Array.from(e.target.files).slice(0, remaining);
    if (e.target.files.length > remaining) {
      toast.error(`Maks ${MAX_IMAGES} bilder per annonse`);
    }
    files.forEach(file => {
      if (file.size > MAX_RAW_SIZE) {
        toast.error(`${file.name} er for stor (maks 15 MB)`);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        setImageArray(prev => [
          ...prev,
          { id: crypto.randomUUID(), name: file.name, data: typeof reader.result === 'string' ? reader.result : undefined, description: '' },
        ]);
      });
    });
  };

  const handleImageDelete = (id: string) => setImageArray(prev => prev.filter(img => img.id !== id));
  const handleImageDescriptionChange = (id: string, description: string) => setImageArray(prev => prev.map(img => img.id === id ? { ...img, description } : img));
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

  const handleRemoveSpecProp = (title: string) => setSpecPropArray(prev => prev.filter(item => item.title !== title));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = validate(listing);
    let hasExtra = false;
    if (imageArray.length === 0) {
      setFieldError('images', 'Minst ett bilde påkrevd');
      hasExtra = true;
    }
    if (listing.postnumber && !postAddress) {
      setFieldError('postnumber', 'Ugyldig postnummer');
      hasExtra = true;
    }
    if (!isValid || hasExtra) return;
    updateMutation.mutate();
  };

  if (isPending) {
    return (
      <div className={styles['page']} style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  if (isError || !fetchedListing) {
    return (
      <div className={styles['page']} style={{ textAlign: 'center', paddingTop: 80 }}>
        <p>Kunne ikke laste annonsen.</p>
      </div>
    );
  }

  if (fetchedListing.sellerId !== user?._id) {
    return (
      <div className={styles['page']} style={{ textAlign: 'center', paddingTop: 80 }}>
        <p>Du har ikke tilgang til å endre denne annonsen.</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <h1 className={styles['page-title']}>Endre annonse</h1>
        <p className={styles['page-subtitle']}>Oppdater informasjonen om produktet ditt</p>
      </div>

      <Row className={styles['layout-row']}>
        <Col className={styles['form-col']} lg={5} md={6}>
          <ListingForm
            listing={listing}
            selectedMainCat={selectedMainCat}
            selectedSubCat={selectedSubCat}
            imageArray={imageArray}
            isModifyListing
            isPublishing={updateMutation.isPending}
            errors={formErrors}
            onPropertyChange={handlePropertyChange}
            onStatusChange={handleStatusChange}
            onImageChange={handleImageChange}
            onImageDelete={handleImageDelete}
            onImageDescriptionChange={handleImageDescriptionChange}
            onImageReorder={handleImageReorder}
            onSpecPropAdd={handleSpecPropAdd}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/my-listings')}
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

export default EditListing;
