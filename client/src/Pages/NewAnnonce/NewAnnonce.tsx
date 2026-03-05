import { useEffect, useState, useRef, DragEvent } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useMutation } from "@tanstack/react-query";
import styles from "./NewAnnonce.module.css";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Spinner from 'react-bootstrap/Spinner';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import TextareaAutosize from 'react-textarea-autosize';

import { getCroppedImage } from "../../utils/cropImage";
import { dataURLtoFile } from "../../utils/dataURltoFile";
import { instanceAxs } from "../../lib/axios";
import { useFindCommuneByPostnumber } from "../../hooks/useNorwayGeo";
import data from '../../categories.json';
import { uiSliceActions } from "../../store/uiSlice";
import { useLocation, useNavigate } from "react-router-dom";

interface AnnonceImage {
  name: string;
  data?: string;
  location?: string;
  description: string;
}

interface SpecProp {
  title: string;
  value: string;
}

interface AnnoncePropertyObject {
  [key: string]: string;
  title: string;
  price: string;
  pricePeriod: string;
  category: string;
  subCategory: string;
  description: string;
  status: string;
  postnumber: string;
  location: string;
}

interface CategoryItem {
  maincategory: string;
  subcategories: string[];
}

const NewAnnonce = () => {
  const user = useAppSelector(state => state.user.user);
  const communeFinder = useFindCommuneByPostnumber();

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [rerender, setRerender] = useState<boolean>(false);
  const [isModifyAnnonce, setIsModifyAnnonce] = useState<boolean>(false);
  const [imageArray, setImageArray] = useState<AnnonceImage[]>([]);
  const [showBackdrop, setShowBackdrop] = useState<boolean>(false);
  const [specPropTitle, setSpecPropTitle] = useState<string>('');
  const [specPropVal, setSpecPropVal] = useState<string>('');
  const [specPropArray, setSpecPropArray] = useState<SpecProp[]>([]);
  const [postAddress, setPostAddress] = useState<string>('Ugyldig postnummer');
  const [postNumber, setPostNumber] = useState<string>('');
  const [selectedMainCat, setSelectedMainCat] = useState<CategoryItem | ''>('');
  const [annoncePropertyObject, setAnnoncePropertyObject] = useState<AnnoncePropertyObject>({
    title: '', price: '', pricePeriod: '', category: '', subCategory: '', description: '', status: '', postnumber: '', location: ''
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const specialProps = specPropArray.filter(item => item.title !== 'Status');
      const annonceProperties = { ...annoncePropertyObject, specialProperties: specialProps };
      const formData = await convertImagesToFormData();

      if (isModifyAnnonce) {
        const annonceId = annoncePropertyObject["_id"];
        await instanceAxs.post('/newannonce/remove/annonceimages', { annonceId });
        const result = await instanceAxs.post(`/newannonce/imageupload?annonceid=${annonceId}`, formData);
        var copyImages = [...imageArray];
        var returnedImages = result.data.files;
        for (let img of copyImages) {
          img.location = (returnedImages as Array<{ originalname: string; location: string }>).find((item) => item.originalname === img.name)?.location;
        }
        await instanceAxs.post('/newannonce/update', { annonceImages: copyImages, annonceproperties: annonceProperties, annonceId });
        return 'updated';
      } else {
        const result = await instanceAxs.post('/newannonce/imageupload', formData);
        if (result.data.message !== 'images uploaded') {
          dispatch(uiSliceActions.setFeedbackBanner({ severity: 'info', msg: result.data.message }));
          throw new Error(result.data.message);
        }
        const annonceId = result.data.annonceId;
        let copyImages = [...imageArray];
        const returnedImages = result.data.files;
        const finalAnnonceImages: AnnonceImage[] = [];
        for (let i = 0; i < copyImages.length; i++) {
          let item = copyImages[i];
          returnedImages.forEach((el: { originalname: string; location: string }) => {
            if (el.originalname === item.name) {
              item.location = el.location;
              finalAnnonceImages.push(item);
            }
          });
        }
        await instanceAxs.post('/newannonce/create', {
          annonceproperties: annonceProperties,
          imagelocations: finalAnnonceImages,
          annonceid: annonceId,
        });
        return 'created';
      }
    },
    onSuccess: (type) => {
      if (type === 'updated') {
        dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: 'Annonsen ble oppdatert' }));
        navigate('/mine-annonser');
      } else {
        dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: 'Annonsen ble publisert' }));
        navigate('/');
      }
    },
    onError: () => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Annonsen kunne ikke publiseres akkurat nå. Vennligst prøv igjen senere.' }));
    },
  });

  const isPublishing = submitMutation.isPending;

  const dragStart = (_e: DragEvent<HTMLLIElement>, position: number) => { dragItem.current = position; };
  const dragEnter = (_e: DragEvent<HTMLLIElement>, position: number) => { dragOverItem.current = position; };
  const drop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copyListItems = [...imageArray];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setImageArray(copyListItems);
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let itemKey = e.target.id;
    let value = e.target.value;
    if (itemKey === "category") {
      const parsed: CategoryItem | '' = JSON.parse(value);
      setSelectedMainCat(parsed);
      value = parsed ? parsed.maincategory : '';
    } else if (itemKey === 'status') {
      var specArray = specPropArray;
      var matchedObj: SpecProp = specArray.find(item => item.title === "Status") || { title: "Status", value: "" };
      let index = specArray.indexOf(matchedObj);
      matchedObj = { title: "Status", value };
      specArray.splice(index, 1, matchedObj);
      setSpecPropArray(specArray);
    } else if (itemKey === 'postnumber') {
      setPostNumber(value);
    }
    setAnnoncePropertyObject(prevState => ({ ...prevState, [itemKey]: value }));
  };

  const handleImageDelete = (e: React.MouseEvent, imagename: string) => {
    e.preventDefault();
    setImageArray(prev => prev.filter(img => img.name !== imagename));
  };

  const handleImageDescription = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, item: AnnonceImage) => {
    var copyImageArray = imageArray;
    var copyItem = item;
    let index = copyImageArray.indexOf(item);
    if (index !== -1) {
      copyItem.description = e.target.value;
      copyImageArray[index] = copyItem;
      setRerender(!rerender);
      setImageArray(copyImageArray);
    }
  };

  const insertSpecialProp = () => {
    let title = specPropTitle;
    let value = specPropVal;
    if (title === '' || value === '') return;
    title = title.charAt(0).toUpperCase() + title.slice(1);
    var specArray = specPropArray;
    let matchedObj = specArray.find((item, index) => {
      if (item.title === title) {
        specArray[index] = { title, value };
        return true;
      }
      return false;
    });
    if (matchedObj) {
      setSpecPropArray([...specArray]);
    } else {
      setSpecPropArray(prevState => [...prevState, { title, value }]);
    }
    setShowBackdrop(false);
  };

  const removeSpecialProp = (title: string) => {
    setSpecPropArray(prev => prev.filter(item => item.title !== title));
  };

  const submitAnnonce = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMutation.mutate();
  };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    Array.from(event.target.files).forEach(file => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        setImageArray(prevState => [...prevState, { name: file.name, data: typeof reader.result === 'string' ? reader.result : undefined, description: '' }]);
      });
    });
  };

  const convertImagesToFormData = async () => {
    var fd = new FormData();
    for (const image of imageArray) {
      if (!image.data) continue;
      const canvas = await getCroppedImage(image.data);
      const canvasDataUrl = canvas.toDataURL("image/jpeg");
      const convertedUrltoFile = dataURLtoFile(canvasDataUrl, image.name);
      fd.append("annonceImages", convertedUrltoFile);
    }
    return fd;
  };

  useEffect(() => {
    const postnumRaw = annoncePropertyObject["postnumber"];
    const postnum: string | number = (postnumRaw !== '' && postnumRaw !== undefined) ? postnumRaw : 0;
    fetch(`https://secure.geonames.org/postalCodeLookupJSON?postalcode=${postnum}&country=no&username=goksoft`, { method: 'GET' })
      .then(response => response.json())
      .then(geoData => {
        var annonceObj = annoncePropertyObject;
        const placeName = geoData.postalcodes[0];
        const postalcode = placeName ? placeName.adminCode2 : 0;
        const placeProperties = communeFinder(postalcode);
        if (placeProperties) {
          annonceObj["fylke"] = placeProperties.fylkesNavn;
          annonceObj["kommune"] = placeProperties.kommuneNavn;
          annonceObj["location"] = placeName.placeName;
          setAnnoncePropertyObject(annonceObj);
        }
        setPostAddress(placeName ? placeName.placeName : 'Ugyldig postnummer');
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postNumber]);

  useEffect(() => {
    const routerState = routerLocation.state;
    if (routerState) {
      let stateAnnonce = routerState.annonce;
      let foundCategory = data.categories.find(item => item.maincategory === stateAnnonce.category);
      setIsModifyAnnonce(true);
      setAnnoncePropertyObject(routerLocation.state.annonce);
      setSpecPropArray(routerLocation.state.annonce.specialProperties);
      setImageArray(routerLocation.state.annonce.annonceImages);
      setPostNumber(stateAnnonce.postnumber);
      setSelectedMainCat(foundCategory ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user.isEmailVerified) {
    return (
      <Modal show={true}>
        <Modal.Header>
          <Modal.Title>Verifiser din email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Du må verifisere din e-mailadresse først for å legge ut en annonse</p>
          <a href='/profil'>
            <Button variant="primary">Gå til min profil</Button>
          </a>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div className="newannonce-container">
      <Row style={{ margin: 0 }}>
        <Col className={`newannonce-col ${styles['input-col']} border`} lg={4} md={6}>
          <Form onSubmit={submitAnnonce}>
            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Tittel</Form.Label>
              <div className={styles['form-group__content']}>
                <Form.Control type="text" id='title' name="title"
                  value={annoncePropertyObject["title"]} required
                  onChange={handlePropertyChange} disabled={isPublishing}
                />
                <OverlayTrigger placement="right" overlay={<Tooltip>Tittel er en kort beskrivelse av produktet ditt. Hold det enkelt og fengende.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Pris</Form.Label>
              <div className="d-flex align-items-center justify-content-space-between">
                <Form.Control type="number" id="price" className="me-3" value={annoncePropertyObject["price"]} required
                  onChange={handlePropertyChange} disabled={isPublishing}
                />
                <p className="me-3">kr</p>
                <Form.Select className="w-50" id="pricePeriod" value={annoncePropertyObject["pricePeriod"]} onChange={handlePropertyChange} required>
                  <option value="">Pris period</option>
                  <option value="totalt">Total pris</option>
                  <option value="per dag">Per dag</option>
                  <option value="per uke">Per uke</option>
                  <option value="per måned">Per måned</option>
                </Form.Select>
                <OverlayTrigger placement="right" overlay={<Tooltip>Gi en pris i NOK til produktet ditt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Hoved Kategori</Form.Label>
              <div className={styles['form-group__content']}>
                <Form.Select id="category" required value={JSON.stringify(selectedMainCat)}
                  onChange={handlePropertyChange} disabled={isPublishing}>
                  <option value={JSON.stringify('')}>Velg en hovedkategori</option>
                  {data.categories.map((item, index) => (
                    <option value={JSON.stringify(item)} key={index}>{item.maincategory}</option>
                  ))}
                </Form.Select>
                <OverlayTrigger placement="right" overlay={<Tooltip>Velg en hovedkategori for produktet ditt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            {selectedMainCat !== '' && (
              <Form.Group className={styles['newannonce-form-group']}>
                <Form.Label>Under Kategori</Form.Label>
                <div className={styles['form-group__content']}>
                  <Form.Select id="subCategory" required value={annoncePropertyObject["subCategory"]}
                    onChange={handlePropertyChange} disabled={isPublishing}>
                    <option value={JSON.stringify('')}>Velg en under kategori</option>
                    {selectedMainCat?.subcategories.map(item => (
                      <option value={item} key={item}>{item}</option>
                    ))}
                  </Form.Select>
                  <OverlayTrigger placement="right" overlay={<Tooltip>Velg en underkategori for mer spesifikt søk.</Tooltip>}>
                    <i className="fa-solid fa-circle-question mx-3" />
                  </OverlayTrigger>
                </div>
              </Form.Group>
            )}

            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Bilder</Form.Label>
              <div className={styles['form-group__content']}>
                <Form.Control type="file" accept="image/*" multiple onChange={onImageChange} disabled={isPublishing} />
                <OverlayTrigger placement="right" overlay={<Tooltip>Last opp bilder av produktet ditt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            <div className={`${styles['review-product-images-small-div']} ${styles['newannonce-form-group']}`}>
              <ul className="images-small-ul" style={{ listStyleType: 'none', padding: 0 }}>
                {typeof imageArray !== 'boolean' && imageArray.map((item, index) => (
                  <li className="images-small-li mb-3" key={index} draggable
                    onDragStart={(e) => dragStart(e, index)}
                    onDragEnter={(e) => dragEnter(e, index)}
                    onDragEnd={drop}>
                    <div className={styles['images-li-div-small']}>
                      <p>{index + 1}.</p>
                      <div className={`${styles['images-li-image-control']} border`}>
                        <span className={styles['image-control-drag-item']}>
                          <i className="fa-solid fa-grip-vertical " />
                        </span>
                        <img key={item.name} className={`${styles['image-span-img']} me-3 ms-3 border`}
                          src={item.data || item.location} alt='product-item'
                        />
                        <Form.Control type='text' value={imageArray[index].description}
                          placeholder={item.name} onChange={e => handleImageDescription(e, item)}
                        />
                        <i className={`fa-solid fa-trash-can ms-3 ${styles['image-control-delete-item']}`}
                          style={{ color: '#dc3545', cursor: 'pointer' }}
                          onClick={(e) => handleImageDelete(e, item.name)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Produkt Beskrivelse</Form.Label>
              <div className={styles['form-group__content']}>
                <Form.Control as="textarea" name="productDescription"
                  id='description' value={annoncePropertyObject["description"]} rows={6}
                  onChange={handlePropertyChange} disabled={isPublishing} required
                />
                <OverlayTrigger placement="right" overlay={<Tooltip>En velskrevet beskrivelse selger produktet ditt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            <Form.Group className={styles['newannonce-form-group']}>
              <Form.Label>Status</Form.Label>
              <div className={styles['form-group__content']}>
                <Form.Check type="radio" value="nytt" name="status" checked={annoncePropertyObject["status"] === 'nytt'}
                  id="status" label="Nytt" onChange={handlePropertyChange} disabled={isPublishing}
                />
                <Form.Check type="radio" value="brukt" name="status" checked={annoncePropertyObject["status"] === 'brukt'}
                  id="status" label="Brukt" onChange={handlePropertyChange} disabled={isPublishing}
                />
                <OverlayTrigger placement="right" overlay={<Tooltip>Velg om produktet ditt er helt nytt eller brukt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
              </div>
            </Form.Group>

            <Form.Group className={styles['newannonce-form-group']} style={{ display: 'flex', flexDirection: 'column' }}>
              <Form.Label>Nokkelinfo</Form.Label>
              <div className={styles['form-group__content']}>
                <Button variant="outline-primary w-100" type='button' onClick={() => setShowBackdrop(true)} disabled={isPublishing}>
                  <i className="fa-solid fa-plus mx-2" /> Legg til ny nokkelinfo
                </Button>
                <OverlayTrigger placement="right" overlay={<Tooltip>Legg til raske fakta om produktet ditt.</Tooltip>}>
                  <i className="fa-solid fa-circle-question mx-3" />
                </OverlayTrigger>
                {showBackdrop && (
                  <div className={styles['newannonce-backdrop']} onClick={() => setShowBackdrop(false)}>
                    <div className={styles['backdrop-model-div']} onClick={(e) => e.stopPropagation()}>
                      <FloatingLabel label="Overskrift" className="mb-3" style={{ color: 'black' }}>
                        <Form.Control type="text" id="title" name='tit' placeholder="Overskrift" onChange={e => setSpecPropTitle(e.target.value)} />
                      </FloatingLabel>
                      <FloatingLabel label="Input" className="mb-3" style={{ color: 'black' }}>
                        <Form.Control type="text" id="value" name="val" placeholder="Input" onChange={e => setSpecPropVal(e.target.value)} />
                      </FloatingLabel>
                      <div className="d-flex" style={{ gap: 20, marginTop: 40 }}>
                        <Button variant="outline-primary" type='button' className="w-75" onClick={insertSpecialProp}>
                          <i className="fa-solid fa-plus mx-2" />Legg til nokkelinfo
                        </Button>
                        <Button variant="outline-dark" type='button' className="w-25" onClick={() => setShowBackdrop(false)}>Lukk</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Form.Group>

            <Form.Group className={styles['newannonce-form-group']}>
              <Row className="d-flex align-items-end">
                <Col>
                  <Form.Label>Addresse</Form.Label>
                  <Form.Control type="text" id="postnumber" placeholder="Postnummer" value={annoncePropertyObject["postnumber"]}
                    required onChange={handlePropertyChange} disabled={isPublishing}
                  />
                </Col>
                <Col className="d-flex justify-content-center">
                  <p>{annoncePropertyObject["location"] === '' ? postAddress : annoncePropertyObject["location"]}</p>
                </Col>
              </Row>
            </Form.Group>

            {isModifyAnnonce ? (
              <>
                {!isPublishing ? (
                  <>
                    <Button variant="primary" type="submit" className={`me-3 ${styles['create-annonce-control-button']}`}>Lagre</Button>
                    <Button variant="outline-primary" type="button" className={styles['create-annonce-control-button']} onClick={() => navigate('/mine-annonser')}>Avbryt</Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" type="button" className={`me-3 ${styles['create-annonce-control-button']}`} disabled>
                      <Spinner size="sm" className="me-2" /> Lagrer...
                    </Button>
                    <Button variant="outline-primary" type="button" className={styles['create-annonce-control-button']} onClick={() => navigate('/mine-annonser')}>Avbryt</Button>
                  </>
                )}
              </>
            ) : (
              <>
                {!isPublishing ? (
                  <Button type="submit" className="mb-3" style={{ width: "100%" }}>Publiser</Button>
                ) : (
                  <Button type="button" className="mb-3" disabled>
                    <Spinner size="sm" className="me-2" /> Publiserer...
                  </Button>
                )}
              </>
            )}
          </Form>
        </Col>

        <Col lg={8} md={6} className={`newannonce-col ${styles['preview-column']}`}>
          <div className={styles['preview-column-content']}>
            {selectedMainCat !== '' && (
              <Breadcrumb className="mt-3">
                <Breadcrumb.Item active>Kategori</Breadcrumb.Item>
                <Breadcrumb.Item href="#">{selectedMainCat?.maincategory}</Breadcrumb.Item>
                <Breadcrumb.Item>{annoncePropertyObject["subCategory"]}</Breadcrumb.Item>
              </Breadcrumb>
            )}

            <Carousel className={`${styles['preview-carousel']} mb-3`} interval={null} variant="dark">
              {imageArray.map((item, index) => (
                <Carousel.Item key={index}>
                  <img src={item.data || item.location} alt="pro-make" className={styles['preview-carousel-image']} />
                  <Carousel.Caption className={styles['preview-carousel-caption']}>
                    <p className={`${styles['carousel-image-text']} mb-4`}>{item.description}</p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>

            <div className={`${styles['preview-content-box']} d-flex align-items-center`}>
              {annoncePropertyObject["price"] && (
                <>
                  <p className="me-2" style={{ fontSize: '20px' }}>{annoncePropertyObject["price"]} kr</p>
                  <p> - {annoncePropertyObject["pricePeriod"]}</p>
                </>
              )}
            </div>

            <p className={`${styles['preview-product-title']} mb-5`}>{annoncePropertyObject["title"]}</p>

            <div className={styles['preview-content-box']}>
              <p className={styles['preview-content-heading']}>Beskrivelse</p>
              <TextareaAutosize className={styles['preview-product-desc']} value={annoncePropertyObject["description"]} disabled />
            </div>

            <div className={styles['preview-content-box']}>
              <p className={`${styles['preview-content-heading']} mb-3`}>Nøkkelinfo</p>
              <div className={styles['special-properties-container']}>
                {specPropArray.length > 0 && specPropArray.map((item, index) => (
                  <div key={index} className={`${styles['spec-prop-item']} border`}>
                    <div key={index} className={styles['spec-prop-box']}>
                      <p className={styles['special-props-title']}>{item.title}</p>
                      <p className="special-props-value">{item.value}</p>
                    </div>
                    <Button type='button' variant="danger"
                      className={`${styles['special-prop-remove-btn']} w-75`} onClick={() => removeSpecialProp(item.title)}>
                      Fjern
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles['preview-content-box']} mb-3`}>
              <p className={`${styles['preview-content-heading']} mb-2`}>Addresse</p>
              <p>{postNumber}</p>
              <p>{postAddress === 'Ugyldig postnummer' ? '' : postAddress}</p>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default NewAnnonce;
