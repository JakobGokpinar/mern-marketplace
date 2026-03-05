import { useLocation } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className={styles['notFound-container']}>
      <div className={styles['notFound-content']}>
        <p className={styles['notFound-code']}>404</p>
        <h1>Side ikke funnet</h1>
        <p><strong>{location.pathname}</strong> eksisterer ikke</p>
        <a href="/">Gå tilbake til hovedsiden</a>
      </div>
    </div>
  );
};

export default NotFound;
