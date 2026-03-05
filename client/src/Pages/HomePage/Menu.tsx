import { useQuery } from '@tanstack/react-query';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from "./Menu.module.css";
import { instanceAxs } from '../../lib/axios';
import { queryKeys } from '../../lib/queryKeys';
import Spinner from 'react-bootstrap/Spinner';

interface MenuProduct {
  _id: string;
  title: string;
  price: number;
  location: string;
  description?: string;
  isFavorite?: boolean;
  sellerId: string;
  annonceImages?: Array<{ location: string }>;
}

const fetchProducts = async (): Promise<MenuProduct[]> => {
  const response = await instanceAxs.get('/search');
  return response.data.productArray || [];
};

const Menu = () => {
  const { data: productArray = [], isPending } = useQuery<MenuProduct[]>({
    queryKey: queryKeys.products.list(),
    queryFn: fetchProducts,
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
