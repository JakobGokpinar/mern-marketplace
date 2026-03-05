import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles['footer']}>
    <span className={styles['brand']}>Rego</span>
    <span className={styles['sep']}>·</span>
    <span className={styles['tagline']}>Kjøp og selg lokalt</span>
    <span className={styles['sep']}>·</span>
    <span className={styles['copy']}>&copy; {new Date().getFullYear()}</span>
  </footer>
);

export default Footer;
