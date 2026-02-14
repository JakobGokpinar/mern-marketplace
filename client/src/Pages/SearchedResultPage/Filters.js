import React, { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap';
import './Filters.css'

import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Tooltip from '@mui/material/Tooltip';

import categoryObject from '../../categories.json';

//location, main cat, sub cat, date, old-new, price
const Filters = ({handleFilterChange, removeSelectedFilter, searchParams, counties, categories}) => {

    const [communes, setCommunes] = useState([]);
    const [state, setState] = useState('');
    const [city, setCity] = useState(['']);
    const [mainCategory, setMainCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [productDate, setProductDate] = useState('');
    const [productStatus, setProductStatus] = useState(false);

    const findCounty = (value) => {
      if(!counties) {
          return null;
      }
      const county = counties.find(item => item.fylkesnummer === value);
      return county;
  }

    const handleChanges = (key, value) => {
        handleFilterChange(key, value)
    }

    const handleStateChange = (e) => {
        let value = e.target.value;
        if(value === ''){
            removeSelectedFilter('fylke')
            return;
        }
        const county = findCounty(value);
        setCommunes(county !== null && county.kommuner)
        handleChanges('fylke', value);
    }
    const handleCityChange = (e) => {
        if(e.target.checked === true){
            handleChanges('kommune', e.target.value)
        }  else {
            removeSelectedFilter('kommune', e.target.value)
        }
    }
    const handleCategoryChange = (e) => {
      let value = JSON.parse(e.target.value);
      setMainCategory(value)
      handleChanges("category", value.maincategory)
    }
    const handleSubCategoryChange = (e) => {
      let value = e.target.value;
      handleChanges("subcategory", value);
      setSubCategory(value)
    }
    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value)
    }
    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value)
    }
    const handlePriceSubmit = () => {
        if (minPrice !== '') {
            handleChanges('min_price', minPrice)
        } 
        if (maxPrice !== ''){
            handleChanges('max_price', maxPrice)
        }
    }
    const handleDateChange = (e) => {
        handleChanges('date', e.target.value)
    }
    const handleStatusChange = (e) => {
      handleChanges('status',e.target.value);
    }

    useEffect(() => {
            let fylke = searchParams.get('fylke');
            if(fylke) {
                setState(fylke);
                const county = findCounty(fylke);
                setCommunes(county !== null && county.kommuner);
            } else {
                setState('');
                setCommunes([])
            }

            let kommune = searchParams.getAll('kommune');
            setCity(kommune === null ? [] : kommune)

            let maincat = searchParams.get('category');
            if(maincat) {
              maincat = categoryObject.categories.find(item => item.maincategory === maincat);
              setMainCategory(maincat ? maincat : '');
            } else {
              setMainCategory('')
            }

            let subcat = searchParams.get('subcategory');
            if(subcat) {
              let cat = categoryObject.categories.find(item => {
                if(item.subcategories.includes(subcat)){
                  return true;
                }
                return ''
              })
              setMainCategory(cat ? cat : '')
              setSubCategory(subcat)
            }

            let min_price = searchParams.get('min_price');
            setMinPrice(min_price || '')

            let max_price = searchParams.get('max_price');
            setMaxPrice(max_price || '');

            let date = searchParams.get('date');
            setProductDate(date || '')

            let status = searchParams.get('status');
            setProductStatus(status || '')

            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, counties])

  return (
    <div>
      <Accordion className="filter-accordion">
        <Accordion.Item>
          <Accordion.Header>Lokasjon</Accordion.Header>
          <Accordion.Body>
            <Form.Select
              aria-label="state-selection"
              className="mb-2"
              onChange={handleStateChange}
              value={state}
            >
              <option value="">Velg en Fylke</option>
              {counties.length > 0 &&
                counties.map((county) => {
                  return (
                    <option
                      key={county.fylkesnummer}
                      value={county.fylkesnummer}
                    >
                      {county.fylkesnavn}
                    </option>
                  );
                })}
            </Form.Select>
            {communes.length > 0 && (
              <div className="commune-filter">
                {communes.map((kommune) => {
                  return (
                    <Form.Check
                      onChange={handleCityChange}
                      checked={
                        city.find(
                          (item) => item === kommune.kommunenavnNorsk
                        ) || false
                      }
                      key={kommune.kommunenummer}
                      label={kommune.kommunenavn}
                      value={kommune.kommunenavn}
                      name={kommune.kommunenavn}
                    ></Form.Check>
                  );
                })}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="filter-accordion">
        <Accordion.Item>
          <Accordion.Header>Kategori</Accordion.Header>
          <Accordion.Body>
            <Form.Select aria-label="maincategory-selection" className="mb-2" onChange={handleCategoryChange} value={mainCategory !== '' && JSON.stringify(mainCategory)}>
            <option value={JSON.stringify('')}>Velg en hovedkategori</option>
            {categoryObject.categories.map((item, index) => {
              return(
                <option value={JSON.stringify(item)} key={index}>
                  {item.maincategory}
                </option>
              ) 
            })}
            </Form.Select>
            {mainCategory !== '' &&  
            <Form.Select aria-label="subcategory-selection" onChange={handleSubCategoryChange} value={subCategory}>
              <option value={JSON.stringify('')}>Velg en under kategori</option>
              {mainCategory.subcategories.map(item => {
                return(
                  <option value={item} key={item}>
                    {item}
                  </option>
                )
              })}
            </Form.Select>
          }
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="filter-accordion">
        <Accordion.Item>
          <Accordion.Header>Pris</Accordion.Header>
          <Accordion.Body>
            <InputGroup className="mb-3">
              <Tooltip title='min. pris' arrow>
              <Form.Control
                type="number"
                placeholder="min. pris"
                onChange={handleMinPriceChange}
                value={minPrice}
              ></Form.Control>
              </Tooltip>
              <InputGroup.Text id="basic-addon2">kr</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
              <Tooltip title='max. pris' arrow>
              <Form.Control
                type="number"
                placeholder="max. pris"
                onChange={handleMaxPriceChange}
                value={maxPrice}
              ></Form.Control>
              </Tooltip>
              <InputGroup.Text id="basic-addon2">kr</InputGroup.Text>
            </InputGroup>
            <Button variant="primary" type='button' onClick={handlePriceSubmit}>Search</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="filter-accordion">
        <Accordion.Item>
          <Accordion.Header>Dato</Accordion.Header>
          <Accordion.Body>
            <Form onChange={handleDateChange}value={productDate}>
              <Form.Check
                type="radio"
                name="date"
                label="Siste 24 timer"
                value="today"
                checked={productDate === "today" ? true : false}
                onChange={e => {}}
              />
              <Form.Check
                type="radio"
                name="date"
                label="I uke"
                value="this week"
                checked={productDate === 'this week'? true : false}
                onChange={e => {}}
              />
              <Form.Check
                type="radio"
                name="date"
                label="I month"
                value="this month"
                checked={productDate === 'this month'? true : false}
                onChange={e => {}}
              />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="filter-accordion">
        <Accordion.Item>
          <Accordion.Header>Status</Accordion.Header>
          <Accordion.Body>
            <Form onChange={handleStatusChange} value={productStatus}>
              <Form.Check type="radio" value="nytt" name="status" label="Nytt" checked={productStatus === "nytt" ? true : false} onChange={e => {}}></Form.Check>
              <Form.Check type="radio" value="brukt" name="status" label="Brukt" checked={productStatus === "brukt" ? true : false} onChange={e => {}}></Form.Check>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default Filters;
