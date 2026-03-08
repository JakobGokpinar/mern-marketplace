import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Icon from '../../components/icons/Icon';
import styles from './ListingForm.module.css';
import ImageManager from './ImageManager';
import SpecialPropsEditor from './SpecialPropsEditor';
import type { ListingImage, ListingPropertyObject, CategoryItem, SubCategoryItem } from './types';
import categoryData from '../../categories.json';

interface ListingFormProps {
  listing: ListingPropertyObject;
  selectedMainCat: CategoryItem | '';
  selectedSubCat: SubCategoryItem | '';
  imageArray: ListingImage[];
  isModifyListing: boolean;
  isPublishing: boolean;
  errors: Record<string, string>;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onStatusChange: (value: 'nytt' | 'brukt') => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (name: string) => void;
  onImageDescriptionChange: (name: string, description: string) => void;
  onImageReorder: (images: ListingImage[]) => void;
  onSpecPropAdd: (title: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  postAddress: string;
}

const ListingForm = ({
  listing,
  selectedMainCat,
  selectedSubCat,
  imageArray,
  isModifyListing,
  isPublishing,
  errors,
  onPropertyChange,
  onStatusChange,
  onImageChange,
  onImageDelete,
  onImageDescriptionChange,
  onImageReorder,
  onSpecPropAdd,
  onSubmit,
  onCancel,
  postAddress,
}: ListingFormProps) => (
  <Form onSubmit={onSubmit} noValidate className={styles['form']}>

    {/* ── KATEGORI ──────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Kategori</p>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Hoved kategori</Form.Label>
        <Form.Select
          id="category"
          value={JSON.stringify(selectedMainCat)}
          onChange={onPropertyChange}
          disabled={isPublishing}
          isInvalid={!!errors.category}
        >
          <option value={JSON.stringify('')}>Velg kategori</option>
          {categoryData.categories.map((item) => (
            <option value={JSON.stringify(item)} key={item.maincategory}>{item.maincategory}</option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
      </Form.Group>

      {selectedMainCat !== '' && (
        <Form.Group className={styles['form-group']}>
          <Form.Label className={styles['field-label']}>Underkategori</Form.Label>
          <Form.Select
            id="subCategory"
            value={JSON.stringify(selectedSubCat)}
            onChange={onPropertyChange}
            disabled={isPublishing}
            isInvalid={!!errors.subCategory}
          >
            <option value={JSON.stringify('')}>Velg underkategori</option>
            {selectedMainCat.subcategories.map((item) => (
              <option value={JSON.stringify(item)} key={item.name}>{item.name}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.subCategory}</Form.Control.Feedback>
        </Form.Group>
      )}

      {selectedSubCat !== '' && selectedSubCat.subsubcategories.length > 0 && (
        <Form.Group className={styles['form-group']}>
          <Form.Label className={styles['field-label']}>Type</Form.Label>
          <Form.Select
            id="subSubCategory"
            value={listing.subSubCategory ?? ''}
            onChange={onPropertyChange}
            disabled={isPublishing}
            isInvalid={!!errors.subSubCategory}
          >
            <option value="">Velg type</option>
            {selectedSubCat.subsubcategories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.subSubCategory}</Form.Control.Feedback>
        </Form.Group>
      )}
    </section>

    {/* ── BILDER ────────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Bilder</p>

      <Form.Group className={styles['form-group']}>
        <label className={styles['upload-label']}>
          <Icon name="cloud-arrow-up" />
          <span>Velg bilder</span>
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={onImageChange}
            disabled={isPublishing}
            className={styles['upload-input']}
          />
        </label>
        {imageArray.length > 0 ? (
          <p className={styles['upload-hint']}>{imageArray.length} bilde{imageArray.length !== 1 ? 'r' : ''} valgt — dra for å sortere</p>
        ) : errors.images && (
          <div className={styles['field-error']}>{errors.images}</div>
        )}
      </Form.Group>

      <ImageManager
        imageArray={imageArray}
        onDelete={onImageDelete}
        onDescriptionChange={onImageDescriptionChange}
        onReorder={onImageReorder}
      />
    </section>

    {/* ── OM PRODUKTET ──────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Om produktet</p>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Tittel</Form.Label>
        <Form.Control
          type="text"
          id="title"
          value={listing.title}
          placeholder="F.eks. iPhone 14 Pro 256GB"
          onChange={onPropertyChange}
          disabled={isPublishing}
          isInvalid={!!errors.title}
        />
        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Beskrivelse</Form.Label>
        <Form.Control
          as="textarea"
          id="description"
          value={listing.description}
          rows={5}
          placeholder="Beskriv produktet ditt — stand, brukstid, hva som følger med..."
          onChange={onPropertyChange}
          disabled={isPublishing}
          isInvalid={!!errors.description}
          required
        />
        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Stand</Form.Label>
        <div className={styles['status-toggle']}>
          <button
            type="button"
            className={`${styles['status-btn']} ${listing.status === 'nytt' ? styles['status-btn--active'] : ''}`}
            onClick={() => onStatusChange('nytt')}
            disabled={isPublishing}
          >
            <Icon name="tag" />
            Nytt
          </button>
          <button
            type="button"
            className={`${styles['status-btn']} ${listing.status === 'brukt' ? styles['status-btn--active'] : ''}`}
            onClick={() => onStatusChange('brukt')}
            disabled={isPublishing}
          >
            <Icon name="recycle" />
            Brukt
          </button>
        </div>
        {errors.status && <div className={styles['field-error']}>{errors.status}</div>}
      </Form.Group>
    </section>

    {/* ── PRIS ──────────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Pris</p>

      <Form.Group className={styles['form-group']}>
        <div className={styles['price-row']}>
          <div className={styles['price-input-wrapper']}>
            <Form.Control
              type="number"
              id="price"
              value={listing.price}
              required
              placeholder="0"
              min={0}
              onChange={onPropertyChange}
              disabled={isPublishing}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
            <span className={styles['price-currency']}>kr</span>
          </div>
          <div className={styles['price-period-wrapper']}>
            <Form.Select
              id="pricePeriod"
              value={listing.pricePeriod}
              onChange={onPropertyChange}
              required
              disabled={isPublishing}
              isInvalid={!!errors.pricePeriod}
              className={styles['price-period']}
            >
              <option value="">Velg periode</option>
              <option value="totalt">Total pris</option>
              <option value="per dag">Per dag</option>
              <option value="per uke">Per uke</option>
              <option value="per måned">Per måned</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.pricePeriod}</Form.Control.Feedback>
          </div>
        </div>
      </Form.Group>
    </section>

    {/* ── NØKKELINFO ────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Nøkkelinfo <span className={styles['optional-tag']}>valgfritt</span></p>
      <SpecialPropsEditor isPublishing={isPublishing} onAdd={onSpecPropAdd} />
    </section>

    {/* ── LOKASJON ──────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Lokasjon</p>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Postnummer</Form.Label>
        <div className={styles['postnumber-row']}>
          <Form.Control
            type="text"
            id="postnumber"
            placeholder="0000"
            value={listing.postnumber}
            required
            maxLength={4}
            onChange={onPropertyChange}
            disabled={isPublishing}
            isInvalid={!!errors.postnumber}
            className={styles['postnumber-input']}
          />
          <Form.Control.Feedback type="invalid">{errors.postnumber}</Form.Control.Feedback>
          {postAddress && (
            <span className={styles['postnumber-place']}>
              <Icon name="location-dot" />
              {postAddress}
            </span>
          )}
        </div>
      </Form.Group>
    </section>

    {/* ── SUBMIT ────────────────────────────────── */}
    <div className={styles['submit-row']}>
      <Button type="submit" variant="primary" className={styles['submit-btn']} disabled={isPublishing}>
        {isPublishing
          ? <><Spinner size="sm" className="me-2" />{isModifyListing ? 'Lagrer...' : 'Publiserer...'}</>
          : isModifyListing ? 'Lagre endringer' : 'Publiser annonse'}
      </Button>
      <Button variant="outline-secondary" type="button" onClick={onCancel} disabled={isPublishing} className={styles['cancel-btn']}>
        Avbryt
      </Button>
    </div>
  </Form>
);

export default ListingForm;
