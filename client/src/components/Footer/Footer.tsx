import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles['footer']}>
    <div className={styles['footer-inner']}>
      <div className={styles['footer-brand']}>
        <div className={styles['footer-brand-mark']}>
          <div className={styles['footer-brand-icon']}>
            <i className="fa-solid fa-tag" />
          </div>
          <span className={styles['footer-brand-name']}>Rego</span>
        </div>
        <p className={styles['footer-tagline']}>Kjøp og selg lokalt</p>
        <p className={styles['footer-copy']}>&copy; {new Date().getFullYear()} Rego</p>
      </div>

      <div className={styles['footer-links']}>
        <div className={styles['footer-links-col']}>
          <p className={styles['footer-links-heading']}>Utforsk</p>
          <a href="/">Hjem</a>
          <a href="/search">Finn annonser</a>
          <a href="/nyannonse">Legg ut annonse</a>
        </div>
        <div className={styles['footer-links-col']}>
          <p className={styles['footer-links-heading']}>Konto</p>
          <a href="/login">Logg inn</a>
          <a href="/register">Registrer deg</a>
          <a href="/min-konto">Min konto</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
