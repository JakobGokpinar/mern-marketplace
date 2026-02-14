import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./NewAnnonce.css";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Spinner from 'react-bootstrap/Spinner';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import Backdrop from '@mui/material/Backdrop';
import TextareaAutosize from 'react-textarea-autosize';

import { getCroppedImage } from "../../utils/cropImage.js";
import { dataURLtoFile } from "../../utils/dataURltoFile.js";
import { instanceAxs } from "../../config/api.js";
import { useFindCommuneByPostnumber } from "../../features/appDataSliceActions.js";
import data from  '../../categories.json';
import { fetchUser } from "../../features/userSliceActions.js";
import { uiSliceActions } from "../../features/uiSlice.js";
import { redirect, useLocation, useNavigate } from "react-router-dom";

const NewAnnonce = () => {
  const loggedIn = useSelector(state => state.user.isLoggedIn);
  const user = useSelector(state => state.user.user)
  const communeFinder = useFindCommuneByPostnumber();
  
  const dragItem = useRef();
  const dragOverItem = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [rerender, setRerender] = useState(false) //dummy state to use force update on imageArray when image description added
  const [isPublishing, setIsPublishing] = useState(false);
  const [isModifyAnnonce, setIsModifyAnnonce] = useState(false);
  const [imageArray, setImageArray] = useState([]);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [specPropTitle, setSpecPropTitle] = useState('');
  const [specPropVal, setSpecPropVal] = useState('');
  const [specPropArray, setSpecPropArray] = useState([]); 
  const [postAddress, setPostAddress] = useState('Ugyldig postnummer');
  const [postNumber, setPostNumber] = useState('')
  const [selectedMainCat, setSelectedMainCat] = useState('')
  const [annoncePropertyObject, setAnnoncePropertyObject] = useState({
    title: '', price: '', pricePeriod: '', category: '', subCategory: '', description: '', status: '', postnumber: '', location: ''
  })

  const dragStart = (e, position) => {
    dragItem.current = position;
  };
  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };
  const drop = (e) => {
    const copyListItems = [...imageArray];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setImageArray(copyListItems);
  };

const handlePropertyChange = (e) => {
  let itemKey = e.target.id;
  let value = e.target.value;
  if(itemKey === "category") {
    value = JSON.parse(value)
    setSelectedMainCat(value);
    value = value.maincategory;
  } else if(itemKey === 'status') {
    var specArray = specPropArray;
    var matchedObj = specArray.find(item => item.title === "Status") || {}
    let index = specArray.indexOf(matchedObj);
    matchedObj= {title: "Status", value}
    specArray.splice(index, 1, matchedObj);
    setSpecPropArray(specArray)
  } else if(itemKey === 'postnumber'){
    setPostNumber(value)
  }
  setAnnoncePropertyObject(prevState => ({
    ...prevState, [itemKey]: value
  }))
}

const handleImageDelete = (e,imagename) => {
  e.preventDefault();
  let imgArr = imageArray;
  imgArr = imgArr.filter(img => img.name !== imagename);
  setImageArray(imgArr)
}   

const handleImageDescription = (e,item) => {
  var copyImageArray = imageArray;
  var copyItem = item;
  let index = copyImageArray.indexOf(item);

  if(index !== -1) {
    copyItem.description = e.target.value;
    copyImageArray[index] = copyItem;
    setImageArray(!rerender);
    setRerender(!rerender)
    setImageArray(copyImageArray);  
  }
}

const insertSpecialProp = () => {
  let title = specPropTitle;
  let value = specPropVal;
  if(title === '' || value === '') return;

  title = title.charAt(0).toUpperCase() + title.slice(1);
  var specArray = specPropArray;
  let matchedObj= specArray.find((item, index) => {
    if(item.title === title) {
      specArray[index] = {title, value};
      return true;
    }
    return null;
  });

  if(matchedObj) {
    setSpecPropArray(specArray)
  } else {
    let specObj = {title, value};
    setSpecPropArray(prevState => [...prevState, specObj])
  }
  setShowBackdrop(false)
}
const removeSpecialProp = (title) => {
  var copyItems = specPropArray;
  copyItems = copyItems.filter(item => item.title !== title);
  setSpecPropArray(copyItems)
}

const submitAnnonce = async (event) => {
  event.preventDefault();
  setIsPublishing(true);

  const specialProps = [];
  specPropArray.forEach(item => {
    if(item.title !== 'Status'){
      specialProps.push(item)
    }
  })
  var annonceProperties = annoncePropertyObject;
  annonceProperties["specialProperties"] = specialProps;
  if(isModifyAnnonce) {
    try {
      const formData = await convertImagesToFormData();
      const annonceId = annoncePropertyObject["_id"];
      const annonceproperties = annonceProperties;
      const res = await instanceAxs.post('/newannonce/remove/annonceimages', {annonceId})
      console.log('res', res)
      const result = await instanceAxs.post(`/newannonce/imageupload?annonceid=${annonceId}`, formData);
      console.log('result', result)
      var copyImages = imageArray;
      var returnedImages = result.data.files;
      for (let img of copyImages) {
        img.location = returnedImages.find(item => 
          item.originalname === img.name).location;
      }
      const response = await instanceAxs.post('/newannonce/update', {annonceImages: copyImages, annonceproperties, annonceId})
      console.log('response', response)
      if(response.status !== 200) {
        dispatch(uiSliceActions.setFeedbackBanner({severity: 'error', msg: 'Annonsen kunne ikke oppdateres akkurat nå. Vennligst prøv igjen senere.'}));
        setIsPublishing(false);
      } else {
        dispatch(uiSliceActions.setFeedbackBanner({severity: 'success', msg: 'Annonsen ble oppdatert'}));
        setIsPublishing(false);
        dispatch(fetchUser());
        setTimeout(() => {
          navigate('/mine-annonser')
        }, 2000)
      }
    } catch (error) {
        console.log(error)
        dispatch(uiSliceActions.setFeedbackBanner({severity: 'error', msg: 'Annonsen kunne ikke oppdateres akkurat nå. Vennligst prøv igjen senere.'}));
        setIsPublishing(false);
    }
  } else {
    setTimeout(async () => {
      const formData = await convertImagesToFormData();
      await uploadImagesToServer(formData, annonceProperties, uploadAnnonceToServer);
    }, 2000);
  }
}

 const  onImageChange = async (event) => {
  if(!event.target.files) return;   //target.files seçilen dosyaları döner

  // Array.from() target.files'ı iterable bir array'e dönüştürür
   Array.from(event.target.files).forEach(file => { 
      var reader = new FileReader();  //Yüklenen resmin datasını oku.
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => { 
      setImageArray(prevState => 
        [...prevState, 
          {name: file.name, data: reader.result, description: '' }
        ])
      })
    })
};

 const convertImagesToFormData =  async () => {
  var formData = new FormData();
  const imgArr = imageArray
  for (const image of imgArr) {   //await kullanımı için for...of döngüsü
    const canvas = await getCroppedImage(image.data);
    const canvasDataUrl = canvas.toDataURL("image/jpeg");
    const convertedUrltoFile = dataURLtoFile(canvasDataUrl, image.name);

    formData.append("annonceImages", convertedUrltoFile);
  }
  return formData;
 }

 const uploadImagesToServer =  async (formData, annonceProps, cb) => {
  await instanceAxs.post('/newannonce/imageupload', formData).then(result => {
    console.log(result)
      if (result.data.message === 'images uploaded') {
        let annonceId = result.data.annonceId;
        let copyImages = imageArray;
        let returnedImages = result.data.files;
        let finalAnnonceImages = []

        for(let i = 0; i<copyImages.length; i++) {
          let item = copyImages[i];
          returnedImages.forEach(el => {
            if(el.originalname === item.name) {
              item.location = el.location;
              finalAnnonceImages.push(item)
            }
          })
        }
        cb(annonceProps, finalAnnonceImages, annonceId)
      } else {
        dispatch(uiSliceActions.setFeedbackBanner({severity: 'info', msg: result.data.message}))
        setIsPublishing(false)
      }
    })
    .catch( err => console.log(err) );
 }

 const uploadAnnonceToServer =  async (anProp, imageLoc, anId) => {
  let annonce = {
    annonceproperties: anProp, 
    imagelocations: imageLoc,
    annonceid: anId
  } 
  await instanceAxs.post('/newannonce/create', annonce).then(result => {
    console.log(result)
    if(result.status === 200) {
      dispatch(uiSliceActions.setFeedbackBanner({severity: 'success', msg: 'Annonsen ble publisert'}));
      setIsPublishing(false);
      dispatch(fetchUser());
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } else {
      dispatch(uiSliceActions.setFeedbackBanner({severity: 'error', msg: 'Annonsen kunne ikke publiseres akkurat nå. Vennligst prøv igjen senere.'}));
      setIsPublishing(false);
    }
  })
  .catch( err => console.log(err) );
 }

 useEffect(() => { 
  var postnum = annoncePropertyObject["postnumber"];
  postnum = (postnum !== '' && postnum !== undefined) ? postnum : 0;  
  fetch(`https://secure.geonames.org/postalCodeLookupJSON?postalcode=${postnum}&country=no&username=goksoft`, 
  {method: 'GET'})
  .then(response => response.json())
  .then(data => {
      var annonceObj = annoncePropertyObject;
      const placeName = data.postalcodes[0];
      const postalcode = placeName ? placeName.adminCode2 : 0;
      const placeProperties = communeFinder(postalcode);
      if(placeProperties) {
        annonceObj["fylke"] = placeProperties.fylkesNavn;
        annonceObj["kommune"] = placeProperties.kommuneNavn;
        annonceObj["location"] = placeName.placeName;
        setAnnoncePropertyObject(annonceObj)
      }
      setPostAddress(placeName ? placeName.placeName : 'Ugyldig postnummer');
  }).catch(err => {
    console.log(err)
  })
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [postNumber])

  useEffect(() => {
    const routerState = routerLocation.state;
  
    if(routerState) {
      console.log("🚀 ~ useEffect ~ routerState: Passed parameters from router", routerState)
      let stateAnnonce = routerState.annonce;
      let foundCategory = data.categories.find(item => item.maincategory === stateAnnonce.category)
      setIsModifyAnnonce(true);
      setAnnoncePropertyObject(routerLocation.state.annonce)
      setSpecPropArray(routerLocation.state.annonce.specialProperties);
      setImageArray(routerLocation.state.annonce.annonceImages);
      setPostNumber(stateAnnonce.postnumber)
      setSelectedMainCat(foundCategory)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

    return (
      <div className="newannonce-container">
            {!loggedIn ? 
                <Modal show={true}>
                    <Modal.Header>
                        <Modal.Title>Du må logge inn</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Du må logge inn for å legge ut annonse</p>
                        <a href="/login">
                            <Button variant="danger">Logg inn</Button>
                        </a>
                    </Modal.Body>
                </Modal>
              :
             (!user.isEmailVerified ? 
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
              :
              <Row style={{margin: 0}}>
                <Col className="newannonce-col input-col border" lg={4}md={6}>
                      <Form onSubmit={submitAnnonce}>
                          <Form.Group className="newannonce-form-group">
                              <Form.Label>Tittel</Form.Label>
                              <div className="form-group__content">
                                  <Form.Control type="text" id='title' name="title" 
                                      value={annoncePropertyObject["title"]} required 
                                      onChange={handlePropertyChange}  disabled={isPublishing}
                                    />
                                    <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Tittel er en kort beskrivelse av produktet ditt. Hold det enkelt og fengende og bruk nøkkelfunksjoner av produktet (f.eks. årsmodell eller merke hvis det er en bil). Begynn å skrive for å se endringer.
                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                              </div>                       
                          </Form.Group>

                          <Form.Group className="newannonce-form-group">
                              <Form.Label>Pris</Form.Label>
                              <div className="d-flex align-items-center justify-content-space-between">
                                  <Form.Control type="number" id="price" className="me-3" value={annoncePropertyObject["price"]} required 
                                      onChange={handlePropertyChange}  disabled={isPublishing}
                                  />
                                  <p className="me-3">kr</p>
                                  <Form.Select className="w-50" id="pricePeriod" value={annoncePropertyObject["pricePeriod"]} onChange={handlePropertyChange}required>
                                      <option value="">Pris period</option>
                                      <option value="totalt">Total pris</option>
                                      <option value="per dag">Per dag</option>
                                      <option value="per uke">Per uke</option>
                                      <option value="per måned">Per måned</option>
                                  </Form.Select>
                                  <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Gi en pris i NOK til produktet ditt. Velg deretter en tidsramme om det er total-, dags-, ukentlig eller månedlig pris.
                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                              </div>
                          </Form.Group>

                          <Form.Group className="newannonce-form-group" onChange={handlePropertyChange}>
                              <Form.Label>Hoved Kategori</Form.Label>
                              <div className="form-group__content">
                              <Form.Select id="category" required value={JSON.stringify(selectedMainCat)}
                                  onChange={handlePropertyChange} disabled={isPublishing}>
                                    <option value={JSON.stringify('')}>Velg en hovedkategori</option>
                                      {
                                        data.categories.map((item,index) => {
                                          return(
                                            <option value={JSON.stringify(item)} key={index}>{item.maincategory}</option>
                                          )
                                        })
                                      }
                              </Form.Select>
                              <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Velg en hovedkategori for produktet ditt. Vi har mange 
                                              forskjellige kategorier, så sørg for at du velger den mest relevante. 
                                              Det hjelper å målrette potensielle kjøpere mer presist.                                          
                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                              </div>
                          </Form.Group>

                          {selectedMainCat !== '' && 
                              <Form.Group className="newannonce-form-group">
                                  <Form.Label>Under Kategori</Form.Label>
                                  <div className="form-group__content">
                                  <Form.Select id="subCategory" required value={annoncePropertyObject["subCategory"]}
                                      onChange={handlePropertyChange} disabled={isPublishing}>
                                        <option value={JSON.stringify('')}>Velg en under kategori</option>
                                        {selectedMainCat?.subcategories.map(item => {
                                          return(
                                            <option value={item} key={item}>{item}</option>
                                          )
                                        })
                                        }
                                  </Form.Select>
                                  <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Du er ett skritt nærmere ditt største salg! Velg en underkategori for å få mer seriøse kunder.
                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                                  </div>
                              </Form.Group>
                          }

                          <Form.Group className="newannonce-form-group">
                              <Form.Label>Bilder</Form.Label>
                              <div className="form-group__content">
                              <Form.Control type="file" accept="image/*" multiple 
                                  onChange={onImageChange}disabled={isPublishing}
                              />
                                                              <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                            Bilder er den beste måten å vise hvor flott produktet ditt er! 
                                            Sørg for at du har noen bilder som representerer de gode egenskapene til produktet 
                                            sammen med å vise riper eller feil hvis det finnes.                                          
                                        </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                                    </div>
                          </Form.Group>

                          <div className="review-product-images-small-div newannonce-form-group">
                              <ul className="images-small-ul" style={{listStyleType: 'none', padding: 0}}>
                                  {typeof imageArray !== 'boolean' && imageArray.map((item,index) => {
                                      return(
                                          <li  className="images-small-li mb-3" key={index} draggable cancel='.btn'
                                            onDragStart={(e) => dragStart(e, index)} onDragEnter={(e) => dragEnter(e, index)} onDragEnd={drop} 
                                            >
                                                <div className="images-li-div-small">
                                                      <p>{index+1}.</p>
                                                      <div className="images-li-image-control border">
                                                              <span className="image-control-drag-item">
                                                                  <i className="fa-solid fa-grip-vertical "/>
                                                              </span>
                                                              <img key={item.name} className="image-span-img me-3 ms-3 border" 
                                                                  src={item.data} alt='product-item'
                                                              />
                                                              <Form.Control type='text' value={imageArray[index].description} 
                                                                  placeholder={item.name} onChange={e => handleImageDescription(e,item)}
                                                              />
                                                              <DeleteIcon color="error" className="ms-3 image-control-delete-item" 
                                                                  onClick={(e) => handleImageDelete(e,item.name)}
                                                              />
                                                      </div>
                                                </div>
                                          </li>
                                      )
                                  })}
                              </ul>
                          </div>

                          <Form.Group className="newannonce-form-group">
                              <Form.Label>Produkt Beskrivelse</Form.Label>
                              <div className="form-group__content">
                              <Form.Control as="textarea" name="productDescription" 
                                    id='description' value={annoncePropertyObject["description"]} rows={6}
                                    onChange={handlePropertyChange} disabled={isPublishing} required
                              />
                                                              <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              En velskrevet beskrivelse er en god måte å overtale kjøpere 
                                              og selge produktet på. Du kan skrive så detaljert som du vil. 
                                              Sørg for at du inkluderer både gode poengene og ulempene med produktet ditt.                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                                    </div>
                          </Form.Group>

                          <Form.Group className="newannonce-form-group">
                              <Form.Label>Status</Form.Label>
                              <div className="form-group__content">
                              <Form.Check 
                                  type="radio" value="nytt" name="status" checked={annoncePropertyObject["status"] === 'nytt'}
                                  id="status" label="Nytt" onChange={handlePropertyChange} disabled={isPublishing}
                                />
                                <Form.Check 
                                  type="radio" value="brukt" name="status" checked={annoncePropertyObject["status"] === 'brukt'}
                                  id="status" label="Brukt" onChange={handlePropertyChange} disabled={isPublishing}
                                />
                                      <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Velg om produktet ditt er helt nytt eller brukt fra før.                                          
                                          </Tooltip>
                                          }
                                        >
                                        <i className="fa-solid fa-circle-question mx-3"/>
                                    </OverlayTrigger>
                                    </div>
                          </Form.Group>

                          <Form.Group className="newannonce-form-group" style={{display: 'flex', flexDirection: 'column'}}>
                              <Form.Label>Nokkelinfo</Form.Label>
                              <div className="form-group__content">
                              <Button variant="outline-primary w-100" type='button' onClick={() => setShowBackdrop(true)} disabled={isPublishing}><i className="fa-solid fa-plus mx-2" /> Legg til ny nokkelinfo</Button>
                              <OverlayTrigger placement="right"
                                      overlay={
                                          <Tooltip>
                                              Legg til raske fakta om produktet ditt. 
                                              Som for eksempel girtype eller årsmodell hvis det er en bil, 
                                              størrelse hvis det er et tøy eller kvadratmeter hvis det er en bolig. 
                                              En meny vil dukke opp når du klikker på den blå knappen og der kan du
                                              kan skrive overskrift (f. eks. Girkasse) og input (Manuel). 
                                              På denne måten kan brukere fange de viktigste punktene uten å lese 
                                              hele beskrivelsen. Du kan legge til så mange av disse du vil, 
                                              men sørg for at de er de viktigste partene av produktet. 
                                              For å fjerne den, hold markøren over eller klikk på.                                          
                                            </Tooltip>
                                          }
                                        > 
                                        <i className="fa-solid fa-circle-question  mx-3"/>
                                    </OverlayTrigger>
                              <Backdrop  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                                  open={showBackdrop}
                                                  >
                                      <div className="backdrop-model-div">
                                              <FloatingLabel
                                                    label="Overskrift"
                                                    className="mb-3"
                                                    style={{color: 'black'}}
                                                  >
                                                    <Form.Control type="text" id="title" name='tit' placeholder="name@example.com" onChange={e => setSpecPropTitle(e.target.value)}/>
                                                </FloatingLabel>
                                                <FloatingLabel
                                                    label="Input"
                                                    className="mb-3"
                                                    style={{color: 'black'}}
                                                  >
                                                    <Form.Control type="text" id="value" name="val" placeholder="name@example.com" onChange={e => setSpecPropVal(e.target.value)
                                                      }/>
                                                </FloatingLabel>
                                                <div className="d-flex" style={{ gap: 20, marginTop: 40}}>

                                                  <Button variant="outline-primary" type='button' className="w-75" onClick={insertSpecialProp}><i className="fa-solid fa-plus mx-2"/>Legg til nokkelinfo</Button>
                                                  <Button variant="outline-dark" type='button' className="w-25" onClick={() => setShowBackdrop(false)}>Lukk</Button>
                                                </div>

                                      </div>
                              </Backdrop>
                              </div>

                          </Form.Group>

                          <Form.Group className="newannonce-form-group">
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

                          {
                            isModifyAnnonce ? 
                              <>
                                {!isPublishing ?
                                    <>
                                        <Button variant="primary" type="submit" className="me-3 create-annonce-control-button">
                                            Lagre
                                        </Button>
                                        <Button variant="outline-primary" type="button" className="create-annonce-control-button"onClick={redirect('/mine-annonser')}>
                                            Avbryt
                                          </Button>   
                                    </>                          
                                  :
                                  <>
                                      <Button variant="primary" type="button" className="me-3 create-annonce-control-button" disabled>
                                          <Spinner size="sm" className="me-2"/> Lagrer...
                                      </Button>
                                      <Button variant="outline-primary" type="button" className="create-annonce-control-button" onClick={redirect('/mine-annonser')}>
                                            Avbryt
                                      </Button>   
                                  </>
                              }

                              </>
                            :
                              <>
                                  {!isPublishing ? 
                                    <Button type="submit" className="mb-3" style={{width: "100%"}}>
                                        Publiser
                                    </Button>
                                    : 
                                    <Button type="button" className="mb-3" disabled>
                                       <Spinner size="sm" className="me-2"/> Publiserer...
                                    </Button>
                                  }
                              </>
                          }
                      </Form>
                </Col>

                <Col lg={8} md={6} className="newannonce-col preview-column">
                      <div className="preview-column-content">

                          {selectedMainCat !== '' && 
                              <Breadcrumb className="mt-3">
                                  <Breadcrumb.Item active>Kategori</Breadcrumb.Item>
                                  <Breadcrumb.Item href="#">{selectedMainCat?.maincategory}</Breadcrumb.Item>
                                  <Breadcrumb.Item>{annoncePropertyObject["subCategory"]}</Breadcrumb.Item>
                              </Breadcrumb>
                            }

                            <Carousel className="preview-carousel mb-3" interval={null} variant="dark">
                                  {imageArray.map((item, index) => {
                                      return(
                                          <Carousel.Item key={index}>
                                                <img src={item.data || item.location} alt="pro-make" className="preview-carousel-image"/>
                                                <Carousel.Caption className="preview-carousel-caption">
                                                    <p className="carousel-image-text mb-4">{item.description}</p>
                                                </Carousel.Caption>
                                          </Carousel.Item>
                                      )
                                  })}
                            </Carousel>

                            <div className="preview-content-box d-flex align-items-center">
                                {annoncePropertyObject["price"] && 
                                      <>
                                        <p className="me-2" style={{fontSize: '20px'}}>{annoncePropertyObject["price"]} kr</p>
                                        <p> - {annoncePropertyObject["pricePeriod"]}</p>   
                                      </>                   
                                }
                            </div>

                            <p className="preview-product-title mb-5">{annoncePropertyObject["title"]}</p>

                            <div className="preview-content-box">
                                <p className="preview-content-heading">Beskrivelse</p>
                                <TextareaAutosize className="preview-product-desc" value={annoncePropertyObject["description"]} disabled/>
                            </div>

                            <div className="preview-content-box">
                                    <p className="preview-content-heading mb-3"> Nøkkelinfo</p>
                                    <div className="special-properties-container">
                                        {specPropArray.length > 0 && specPropArray.map((item, index) => {
                                              return(
                                                <div key={index} className="spec-prop-item border">
                                                    <div key={index}className="spec-prop-box">
                                                        <p className="special-props-title">{item.title}</p>
                                                        <p className="special-props-value">{item.value}</p>
                                                    </div>
                                                    <Button type='button' variant="danger" 
                                                      className="special-prop-remove-btn w-75" onClick={() => removeSpecialProp(item.title)}>
                                                        Fjern
                                                    </Button>
                                                </div>
                                              )
                                        })}
                                    </div>
                            </div>

                            <div className="preview-content-box mb-3">
                                    <p className="preview-content-heading mb-2">Addresse</p>
                                    <p>{postNumber}</p>
                                    <p>{postAddress === 'Ugyldig postnummer' ? '' : postAddress}</p>
                            </div>

                      </div>
                </Col>

              </Row>)
          }
      </div>
    );
  }


export default NewAnnonce;
