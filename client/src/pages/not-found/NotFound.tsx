import { useLocation } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className={styles['not-found-container']}>
      <div className={styles['not-found-content']}>
        <p className={styles['not-found-code']}>404</p>
        <h1>Side ikke funnet</h1>
        <p><strong>{location.pathname}</strong> eksisterer ikke</p>
        <a href="/">Gå tilbake til hovedsiden</a>
      </div>
    </div>
  );
};

export default NotFound;
