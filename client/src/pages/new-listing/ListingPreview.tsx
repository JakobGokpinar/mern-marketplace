import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Carousel from 'react-bootstrap/Carousel';
import Icon from '../../components/icons/Icon';
import styles from './ListingPreview.module.css';
import type { ListingImage, SpecProp, ListingPropertyObject, CategoryItem } from './types';

interface ListingPreviewProps {
  listing: ListingPropertyObject;
  selectedMainCat: CategoryItem | '';
  imageArray: ListingImage[];
  specPropArray: SpecProp[];
  postNumber: string;
  postAddress: string;
  onRemoveSpecProp: (title: string) => void;
}

const ListingPreview = ({
  listing,
  selectedMainCat,
  imageArray,
  specPropArray,
  postNumber,
  postAddress,
  onRemoveSpecProp,
}: ListingPreviewProps) => {
  const isEmpty =
    selectedMainCat === '' &&
    imageArray.length === 0 &&
    !listing.title &&
    !listing.description &&
    !listing.price &&
    specPropArray.length === 0 &&
    !postNumber;

  return (
    <div className={styles['preview']}>

      {/* ── Empty state ────────────────────────────── */}
      {isEmpty && (
        <div className={styles['preview-header']}>
          <Icon name="eye-outline" />
          <span>Forhåndsvisning</span>
        </div>
      )}
      {isEmpty && (
        <div className={styles['empty-state']}>
          <Icon name="rectangle-list-outline" className={styles['empty-icon']} />
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
              {listing.subCategory && <Breadcrumb.Item>{listing.subCategory}</Breadcrumb.Item>}
              {listing.subSubCategory && <Breadcrumb.Item>{listing.subSubCategory}</Breadcrumb.Item>}
            </Breadcrumb>
          )}
          {imageArray.length > 0 && (
            <div className={styles['carousel-wrapper']}>
              <Carousel className={styles['carousel']} interval={null} variant="dark">
                {imageArray.map((item) => (
                  <Carousel.Item key={item.name}>
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
      {(listing.title || listing.price) && (
        <div className={styles['title-price-group']}>
          {listing.title && <h1 className={styles['title']}>{listing.title}</h1>}
          {listing.price && (
            <div className={styles['price-bar']}>
              <span className={styles['price']}>
                {Number(listing.price).toLocaleString('nb-NO')} kr
              </span>
              {listing.pricePeriod && (
                <span className={styles['price-period']}>{listing.pricePeriod}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Beskrivelse ────────────────────────────── */}
      {listing.description && (
        <div className={styles['section']}>
          <p className={styles['section-label']}>Beskrivelse</p>
          <textarea
            className={styles['description']}
            value={listing.description}
            disabled
            readOnly
          />
        </div>
      )}

      {/* ── Nøkkelinfo ────────────────────────────── */}
      {specPropArray.length > 0 && (
        <div className={styles['section']}>
          <p className={styles['section-label']}>Nøkkelinfo</p>
          <div className={styles['spec-grid']}>
            {specPropArray.map((item) => (
              <div
                key={item.title}
                className={styles['spec-card']}
                onClick={() => onRemoveSpecProp(item.title)}
                title="Klikk for å fjerne"
              >
                <span className={styles['spec-label']}>{item.title}</span>
                <span className={styles['spec-value']}>{item.value}</span>
                <span className={styles['spec-remove']}>
                  <Icon name="xmark" />
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
            <Icon name="location-dot" />
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

export default ListingPreview;
