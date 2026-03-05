import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from "./Menu.module.css";
import { queryKeys } from '../../lib/queryKeys';
import { fetchProductsApi } from '../../services/productService';
import Spinner from 'react-bootstrap/Spinner';

const CATEGORIES = [
  { label: 'Elektronikk',         icon: 'fa-laptop',    slug: 'Elektronikk' },
  { label: 'Møbler',              icon: 'fa-couch',     slug: 'Møbler og interiør' },
  { label: 'Klær og mote',        icon: 'fa-shirt',     slug: 'Klær og mote' },
  { label: 'Sport',               icon: 'fa-bicycle',   slug: 'Sport og friluftsliv' },
  { label: 'Bil og kjøretøy',     icon: 'fa-car',       slug: 'Bil og kjøretøy' },
  { label: 'Hage',                icon: 'fa-seedling',  slug: 'Hage og utemiljø' },
  { label: 'Barneartikler',       icon: 'fa-baby',      slug: 'Barneartikler' },
  { label: 'Hobby og fritid',     icon: 'fa-palette',   slug: 'Hobby og fritid' },
];

const Menu = () => {
  const { data: productArray = [], isPending } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: fetchProductsApi,
  });

  return (
    <div className={styles['homepage']}>
      <div className={styles['homepage-hero']}>
        <h1 className={styles['homepage-hero-title']}>Finn gode brukthandler nær deg</h1>
        <p className={styles['homepage-hero-subtitle']}>Bla gjennom annonser fra folk i ditt nærområde</p>
        <div className={styles['homepage-categories']}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to={`/search?category=${encodeURIComponent(cat.slug)}`}
              className={styles['homepage-category-chip']}
            >
              <i className={`fa-solid ${cat.icon}`} />
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className={styles['homepage-loading']}>
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : productArray.length > 0 ? (
        <div className={styles['homepage-grid']}>
          {productArray.map((product, index) => (
            <ProductCard
              key={product._id || index}
              images={product.annonceImages}
              title={product.title}
              price={product.price}
              id={product._id}
              location={product.location}
              description={product.description}
              isFavorite={product.isFavorite}
              sellerId={product.sellerId}
            />
          ))}
        </div>
      ) : (
        <div className={styles['homepage-empty']}>
          <i className="fa-solid fa-box-open" />
          <p>Ingen annonser ennå</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
