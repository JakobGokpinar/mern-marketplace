import { useQuery } from '@tanstack/react-query';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from "./Menu.module.css";
import { queryKeys } from '../../lib/queryKeys';
import { fetchProductsApi } from '../../services/productService';
import Spinner from 'react-bootstrap/Spinner';

const Menu = () => {
  const { data: productArray = [], isPending } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: fetchProductsApi,
  });

  if (isPending) {
    return (
      <div className={styles['homepage-loading']}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div className={styles['homepage']}>
      {productArray.length > 0 ? (
        <>
          <div className={styles['homepage-grid']}>
            {productArray.map((product) => (
              <ProductCard
                key={product._id}
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
        </>
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
