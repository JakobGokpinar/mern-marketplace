import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useLocation } from 'react-router-dom';
import gif from '../utils/not-found.gif';
import styles from './NotFound.module.css';

const NotFound = () => {
    let location = useLocation();

    return(
        <div className={styles['notFound-container']}>
            <Row className='row'>
                <Col lg={6} >
                        <div className={styles['notFound-content']}>
                        <h1>Side Feil</h1>
                        <p>Det ser ut til at <strong>{location.pathname}</strong> ikke eksisterer</p>
                        <p>Prøv å bruke en gyldig lenke eller gå tilbake til <a href='/'>hovedsiden</a></p>
                    </div>
                </Col>
                <Col lg={6} >
                    <img src={gif} className={styles['notFound-gif']} alt='foundy'/>
                </Col>
            </Row>
        </div>
    )
}
export default NotFound;
