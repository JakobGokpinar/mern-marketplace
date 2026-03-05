import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from "./Menu.module.css";
import { queryKeys } from '../../lib/queryKeys';
import { fetchProductsApi } from '../../services/productService';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { ProductGridSkeleton } from '../../components/Skeleton/ProductCardSkeleton';
import type { Product } from '../../types/product';

const Menu = () => {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.products.list(page),
    queryFn: async () => {
      const res = await fetchProductsApi(page);
      setAllProducts(prev => page === 1 ? res.productArray : [...prev, ...res.productArray]);
      return res;
    },
  });

  const totalPages = data?.totalPages ?? 1;
  const hasMore = page < totalPages;

  if (isPending && page === 1) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className={styles['homepage']}>
      {allProducts.length > 0 ? (
        <>
          <div className={styles['homepage-grid']}>
            {allProducts.map((product) => (
              <ProductCard
                key={product._id}
                images={product.images}
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
          {hasMore && (
            <div className={styles['homepage-load-more']}>
              <Button
                variant="outline-primary"
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? <Spinner animation="border" size="sm" /> : 'Last inn flere'}
              </Button>
            </div>
          )}
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
