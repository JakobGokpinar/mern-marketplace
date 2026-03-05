import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Carousel from 'react-bootstrap/Carousel';
import TextareaAutosize from 'react-textarea-autosize';
import styles from './AnnoncePreview.module.css';
import type { AnnonceImage, SpecProp, AnnoncePropertyObject, CategoryItem } from './types';

interface AnnoncePreviewProps {
  annonce: AnnoncePropertyObject;
  selectedMainCat: CategoryItem | '';
  imageArray: AnnonceImage[];
  specPropArray: SpecProp[];
  postNumber: string;
  postAddress: string;
  onRemoveSpecProp: (title: string) => void;
}

const AnnoncePreview = ({
  annonce,
  selectedMainCat,
  imageArray,
  specPropArray,
  postNumber,
  postAddress,
  onRemoveSpecProp,
}: AnnoncePreviewProps) => {
  const isEmpty =
    selectedMainCat === '' &&
    imageArray.length === 0 &&
    !annonce.title &&
    !annonce.description &&
    !annonce.price &&
    specPropArray.length === 0 &&
    !postNumber;

  return (
    <div className={styles['preview']}>

      {/* ── Empty state ────────────────────────────── */}
      {isEmpty && (
        <div className={styles['preview-header']}>
          <i className="fa-regular fa-eye" />
          <span>Forhåndsvisning</span>
        </div>
      )}
      {isEmpty && (
        <div className={styles['empty-state']}>
          <i className={`fa-regular fa-rectangle-list ${styles['empty-icon']}`} />
          <p className={styles['empty-title']}>Ingen innhold ennå</p>
          <p className={styles['empty-sub']}>
            Det du fyller inn til venstre vises her i sanntid
          </p>
        </div>
      )}

      {/* ── Kategori + Bilder — tight group ───────── */}
      {(selectedMainCat !== '' || imageArray.length > 0) && (
        <div className={styles['media-section']}>
          {selectedMainCat !== '' && (
            <Breadcrumb className={styles['breadcrumb']}>
              <Breadcrumb.Item active>Kategori</Breadcrumb.Item>
              <Breadcrumb.Item href="#">{selectedMainCat.maincategory}</Breadcrumb.Item>
              {annonce.subCategory && <Breadcrumb.Item>{annonce.subCategory}</Breadcrumb.Item>}
              {annonce.subSubCategory && <Breadcrumb.Item>{annonce.subSubCategory}</Breadcrumb.Item>}
            </Breadcrumb>
          )}
          {imageArray.length > 0 && (
            <div className={styles['carousel-wrapper']}>
              <Carousel className={styles['carousel']} interval={null} variant="dark">
                {imageArray.map((item, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={item.data ?? item.location}
                      alt="preview"
                      className={styles['carousel-image']}
                    />
                    {item.description && (
                      <Carousel.Caption className={styles['carousel-caption']}>
                        <p className={`${styles['caption-text']} mb-4`}>{item.description}</p>
                      </Carousel.Caption>
                    )}
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          )}
        </div>
      )}

      {/* ── Title + Price — tight group ────────────── */}
      {(annonce.title || annonce.price) && (
        <div className={styles['title-price-group']}>
          {annonce.title && <h1 className={styles['title']}>{annonce.title}</h1>}
          {annonce.price && (
            <div className={styles['price-bar']}>
              <span className={styles['price']}>
                {Number(annonce.price).toLocaleString('nb-NO')} kr
              </span>
              {annonce.pricePeriod && (
                <span className={styles['price-period']}>{annonce.pricePeriod}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Beskrivelse ────────────────────────────── */}
      {annonce.description && (
        <div className={styles['section']}>
          <p className={styles['section-label']}>Beskrivelse</p>
          <TextareaAutosize
            className={styles['description']}
            value={annonce.description}
            disabled
          />
        </div>
      )}

      {/* ── Nøkkelinfo ────────────────────────────── */}
      {specPropArray.length > 0 && (
        <div className={styles['section']}>
          <p className={styles['section-label']}>Nøkkelinfo</p>
          <div className={styles['spec-grid']}>
            {specPropArray.map((item, index) => (
              <div
                key={index}
                className={styles['spec-card']}
                onClick={() => onRemoveSpecProp(item.title)}
                title="Klikk for å fjerne"
              >
                <span className={styles['spec-label']}>{item.title}</span>
                <span className={styles['spec-value']}>{item.value}</span>
                <span className={styles['spec-remove']}>
                  <i className="fa-solid fa-xmark" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lokasjon ──────────────────────────────── */}
      {(postNumber || postAddress) && (
        <div className={styles['section']}>
          <p className={styles['section-label']}>Lokasjon</p>
          <div className={styles['address']}>
            <i className="fa-solid fa-location-dot" />
            <div>
              {postNumber && <p>{postNumber}</p>}
              {postAddress && <p>{postAddress}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnoncePreview;
