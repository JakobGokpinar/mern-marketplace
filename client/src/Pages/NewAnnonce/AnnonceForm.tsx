import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import styles from './AnnonceForm.module.css';
import ImageManager from './ImageManager';
import SpecialPropsEditor from './SpecialPropsEditor';
import type { AnnonceImage, AnnoncePropertyObject, CategoryItem, SubCategoryItem } from './types';
import categoryData from '../../categories.json';

interface AnnonceFormProps {
  annonce: AnnoncePropertyObject;
  selectedMainCat: CategoryItem | '';
  selectedSubCat: SubCategoryItem | '';
  imageArray: AnnonceImage[];
  isModifyAnnonce: boolean;
  isPublishing: boolean;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onStatusChange: (value: 'nytt' | 'brukt') => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (name: string) => void;
  onImageDescriptionChange: (name: string, description: string) => void;
  onImageReorder: (images: AnnonceImage[]) => void;
  onSpecPropAdd: (title: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  postAddress: string;
}

const AnnonceForm = ({
  annonce,
  selectedMainCat,
  selectedSubCat,
  imageArray,
  isModifyAnnonce,
  isPublishing,
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
}: AnnonceFormProps) => (
  <Form onSubmit={onSubmit} className={styles['form']}>

    {/* ── KATEGORI ──────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Kategori</p>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Hoved kategori</Form.Label>
        <Form.Select
          id="category"
          required
          value={JSON.stringify(selectedMainCat)}
          onChange={onPropertyChange}
          disabled={isPublishing}
        >
          <option value={JSON.stringify('')}>Velg kategori</option>
          {categoryData.categories.map((item) => (
            <option value={JSON.stringify(item)} key={item.maincategory}>{item.maincategory}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedMainCat !== '' && (
        <Form.Group className={styles['form-group']}>
          <Form.Label className={styles['field-label']}>Underkategori</Form.Label>
          <Form.Select
            id="subCategory"
            required
            value={JSON.stringify(selectedSubCat)}
            onChange={onPropertyChange}
            disabled={isPublishing}
          >
            <option value={JSON.stringify('')}>Velg underkategori</option>
            {selectedMainCat.subcategories.map((item) => (
              <option value={JSON.stringify(item)} key={item.name}>{item.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      {selectedSubCat !== '' && selectedSubCat.subsubcategories.length > 0 && (
        <Form.Group className={styles['form-group']}>
          <Form.Label className={styles['field-label']}>Type</Form.Label>
          <Form.Select
            id="subSubCategory"
            value={annonce.subSubCategory ?? ''}
            onChange={onPropertyChange}
            disabled={isPublishing}
          >
            <option value="">Velg type</option>
            {selectedSubCat.subsubcategories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}
    </section>

    {/* ── BILDER ────────────────────────────────── */}
    <section className={styles['section']}>
      <p className={styles['section-label']}>Bilder</p>

      <Form.Group className={styles['form-group']}>
        <label className={styles['upload-label']}>
          <i className="fa-solid fa-cloud-arrow-up" />
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
        {imageArray.length > 0 && (
          <p className={styles['upload-hint']}>{imageArray.length} bilde{imageArray.length !== 1 ? 'r' : ''} valgt — dra for å sortere</p>
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
          value={annonce.title}
          required
          placeholder="F.eks. iPhone 14 Pro 256GB"
          onChange={onPropertyChange}
          disabled={isPublishing}
        />
      </Form.Group>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Beskrivelse</Form.Label>
        <Form.Control
          as="textarea"
          id="description"
          value={annonce.description}
          rows={5}
          placeholder="Beskriv produktet ditt — stand, brukstid, hva som følger med..."
          onChange={onPropertyChange}
          disabled={isPublishing}
          required
        />
      </Form.Group>

      <Form.Group className={styles['form-group']}>
        <Form.Label className={styles['field-label']}>Stand</Form.Label>
        <div className={styles['status-toggle']}>
          <button
            type="button"
            className={`${styles['status-btn']} ${annonce.status === 'nytt' ? styles['status-btn--active'] : ''}`}
            onClick={() => onStatusChange('nytt')}
            disabled={isPublishing}
          >
            <i className="fa-solid fa-tag" />
            Nytt
          </button>
          <button
            type="button"
            className={`${styles['status-btn']} ${annonce.status === 'brukt' ? styles['status-btn--active'] : ''}`}
            onClick={() => onStatusChange('brukt')}
            disabled={isPublishing}
          >
            <i className="fa-solid fa-recycle" />
            Brukt
          </button>
        </div>
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
              value={annonce.price}
              required
              placeholder="0"
              min={0}
              onChange={onPropertyChange}
              disabled={isPublishing}
            />
            <span className={styles['price-currency']}>kr</span>
          </div>
          <Form.Select
            id="pricePeriod"
            value={annonce.pricePeriod}
            onChange={onPropertyChange}
            required
            disabled={isPublishing}
            className={styles['price-period']}
          >
            <option value="">Velg periode</option>
            <option value="totalt">Total pris</option>
            <option value="per dag">Per dag</option>
            <option value="per uke">Per uke</option>
            <option value="per måned">Per måned</option>
          </Form.Select>
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
            value={annonce.postnumber}
            required
            maxLength={4}
            onChange={onPropertyChange}
            disabled={isPublishing}
            className={styles['postnumber-input']}
          />
          {postAddress && (
            <span className={styles['postnumber-place']}>
              <i className="fa-solid fa-location-dot" />
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
          ? <><Spinner size="sm" className="me-2" />{isModifyAnnonce ? 'Lagrer...' : 'Publiserer...'}</>
          : isModifyAnnonce ? 'Lagre endringer' : 'Publiser annonse'}
      </Button>
      <Button variant="outline-secondary" type="button" onClick={onCancel} disabled={isPublishing} className={styles['cancel-btn']}>
        Avbryt
      </Button>
    </div>
  </Form>
);

export default AnnonceForm;
