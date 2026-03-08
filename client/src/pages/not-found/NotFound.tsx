import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles['not-found-container']}>
      <div className={styles['not-found-content']}>
        <p className={styles['not-found-code']}>404</p>
        <h1>Side ikke funnet</h1>
        <p>Denne siden finnes ikke</p>
        <a href="/">Gå tilbake til hovedsiden</a>
      </div>
    </div>
  );
};

export default NotFound;
