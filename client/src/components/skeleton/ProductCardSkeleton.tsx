import styles from './Skeleton.module.css';

const ProductCardSkeleton = () => (
  <div className={styles['skeleton-card']}>
    <div className={`${styles['skeleton']} ${styles['skeleton-image']}`} />
    <div className={styles['skeleton-body']}>
      <div className={`${styles['skeleton']} ${styles['skeleton-title']}`} />
      <div className={`${styles['skeleton']} ${styles['skeleton-text']}`} />
      <div className={`${styles['skeleton']} ${styles['skeleton-price']}`} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className={styles['skeleton-grid']}>
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductCardSkeleton;
