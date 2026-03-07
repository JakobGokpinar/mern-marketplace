import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ListingCard from '../../components/listing-card/ListingCard';
import styles from "./Home.module.css";
import { queryKeys } from '../../lib/queryKeys';
import { fetchProductsApi } from '../../services/productService';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { ListingGridSkeleton } from '../../components/skeleton/ListingCardSkeleton';
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
    return <ListingGridSkeleton />;
  }

  return (
    <div className={styles['homepage']}>
      {allProducts.length > 0 ? (
        <>
          <div className={styles['homepage-grid']}>
            {allProducts.map((product) => (
              <ListingCard
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
