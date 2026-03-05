import styles from "./Profile.module.css";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Account = () => {
  return (
    <div className="profileLinks">
      <Row className={styles['profilelink-row']}>
          <Col lg={6} className={styles['profilelink-col']}>
              <a href='/profil'>
                  <div className={styles['profilelink-box']}>
                      <i className={`fa-regular fa-user ${styles['profilelink-box-icon']}`}/>
                      <h3>Profil</h3>
                      <p>Se din profil</p>
                  </div>
              </a>
              <a href='/chat'>
                  <div className={styles['profilelink-box']}>
                      <i className={`fa-regular fa-message ${styles['profilelink-box-icon']}`}/>
                      <h3>Meldinger</h3>
                      <p>Se meldingene dine</p>
                  </div>
              </a>
              <a href='/nyannonse'>
                  <div className={styles['profilelink-box']}>
                      <i className={`fa-regular fa-square-plus ${styles['profilelink-box-icon']}`}/>
                      <h3>Ny Annonse</h3>
                      <p>Danne og publisere en ny annonse</p>
                  </div>
              </a>
          </Col>
          <Col lg={6} className={styles['profilelink-col']}>
              <a href='/favoritter'>
                  <div className={styles['profilelink-box']}>
                      <i className={`fa-regular fa-heart ${styles['profilelink-box-icon']}`}/>
                      <h3>Favoritter</h3>
                      <p>Se og endre dine favoritte annonser</p>
                  </div>
              </a>
              <a href='/mine-annonser'>
                  <div className={styles['profilelink-box']}>
                      <i className={`fa-solid fa-receipt ${styles['profilelink-box-icon']}`}/>
                      <h3>Annonsene Mine</h3>
                      <p>Se og endre annonsene dine</p>
                  </div>
              </a>
          </Col>
      </Row>
    </div>
  );
};

export default Account;
