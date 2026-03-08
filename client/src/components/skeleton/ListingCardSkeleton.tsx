import styles from './Skeleton.module.css';

const ListingCardSkeleton = () => (
  <div className={styles['skeleton-card']}>
    <div className={`${styles['skeleton']} ${styles['skeleton-image']}`} />
    <div className={styles['skeleton-body']}>
      <div className={`${styles['skeleton']} ${styles['skeleton-title']}`} />
      <div className={`${styles['skeleton']} ${styles['skeleton-text']}`} />
      <div className={`${styles['skeleton']} ${styles['skeleton-price']}`} />
    </div>
  </div>
);

export const ListingCardSkeletons = ({ count = 4 }: { count?: number }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </>
);

export default ListingCardSkeleton;
