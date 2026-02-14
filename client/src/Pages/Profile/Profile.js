import React from "react";
import "./Profile.css";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Account = () => {
  return (
    <div className="profileLinks">
      <Row className="profilelink-row">
          <Col lg={6} className="profilelink-col">
              <a href='/profil'>
                  <div className="profilelink-box">
                      <i className="fa-regular fa-user profilelink-box-icon"/>
                      <h3>Profil</h3>
                      <p>Se din profil</p>
                  </div>
              </a>
              <a href='/chat'>
                  <div className="profilelink-box" >
                      <i className="fa-regular fa-message profilelink-box-icon"/>
                      <h3>Meldinger</h3>
                      <p>Se meldingene dine</p>
                  </div>
              </a>
              <a href='/nyannonse'>
                  <div className="profilelink-box">
                      <i className="fa-regular fa-square-plus profilelink-box-icon"/>
                      <h3>Ny Annonse</h3>
                      <p>Danne og publisere en ny annonse</p>
                  </div>
              </a>
          </Col>
          <Col lg={6} className="profilelink-col">
              <a href='/favoritter'>
                  <div className="profilelink-box">
                      <i className="fa-regular fa-heart profilelink-box-icon"/>
                      <h3>Favoritter</h3>
                      <p>Se og endre dine favoritte annonser</p>
                  </div>
              </a>
              <a href='/mine-annonser'>
                  <div className="profilelink-box">
                      <i className="fa-solid fa-receipt profilelink-box-icon"/>
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
