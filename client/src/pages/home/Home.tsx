import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ListingCard from '../../components/listing-card/ListingCard';
import Icon from '../../components/icons/Icon';
import styles from "./Home.module.css";
import { queryKeys } from '../../lib/queryKeys';
import { fetchListingsApi } from '../../services/productService';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { ListingCardSkeletons } from '../../components/skeleton/ListingCardSkeleton';
import type { Listing } from '../../types/listing';

const Menu = () => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Record<number, Listing[]>>({});

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.products.list(page),
    queryFn: () => fetchListingsApi(page),
  });

  useEffect(() => {
    if (data?.productArray) {
      setPages(prev => ({ ...prev, [page]: data.productArray }));
    }
  }, [data, page]);

  const allListings = Object.keys(pages)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap(k => pages[Number(k)]);

  const totalPages = data?.totalPages ?? 1;
  const hasMore = page < totalPages;

  const isInitialLoad = isPending && page === 1;

  return (
    <div className={styles['homepage']}>
      {isInitialLoad ? (
        <div className={styles['homepage-grid']}>
          <ListingCardSkeletons count={4} />
        </div>
      ) : allListings.length > 0 ? (
        <>
          <div className={styles['homepage-grid']}>
            {allListings.map((product) => (
              <ListingCard
                key={product._id}
                images={product.images}
                title={product.title}
                price={product.price}
                id={product._id}
                location={product.location}
                description={product.description}
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
          <div className={styles['homepage-empty-icon']}>
            <Icon name="tag" size={40} />
          </div>
          <h2 className={styles['homepage-empty-title']}>Ingen annonser ennå</h2>
          <p className={styles['homepage-empty-subtitle']}>Bli den første til å legge ut noe!</p>
          <a href="/new-listing" className={styles['homepage-empty-cta']}>
            <Icon name="plus" size={14} />
            Legg ut annonse
          </a>
        </div>
      )}
    </div>
  );
};

export default Menu;
