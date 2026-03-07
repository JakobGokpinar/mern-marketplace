import Icon from '../icons/Icon';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles['footer']}>
    <div className={styles['footer-inner']}>
      <div className={styles['footer-brand']}>
        <div className={styles['footer-brand-mark']}>
          <div className={styles['footer-brand-icon']}>
            <Icon name="tag" />
          </div>
          <span className={styles['footer-brand-name']}>Rego</span>
        </div>
        <p className={styles['footer-tagline']}>Kjøp og selg lokalt</p>
        <p className={styles['footer-copy']}>&copy; {new Date().getFullYear()}</p>
      </div>

      <div className={styles['footer-links']}>
        <p className={styles['footer-links-heading']}>Konto</p>
        <a href="/">Hjem</a>
        <a href="/account">Konto</a>
      </div>
    </div>
  </footer>
);

export default Footer;
