import React, { useState, useEffect } from 'react'
import { InputGroup } from 'react-bootstrap';
import styles from './Filters.module.css';

import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import categoryObject from '../../categories.json';

interface Kommune {
  kommunenummer: string;
  kommunenavn: string;
}

interface County {
  fylkesnummer: string;
  fylkesnavn: string;
  kommuner?: Kommune[];
}

interface FiltersProps {
  handleFilterChange: (key: string, value: string) => void;
  removeSelectedFilter: (key: string, value?: string) => void;
  searchParams: URLSearchParams;
  counties: County[];
}

const Filters = ({ handleFilterChange, removeSelectedFilter, searchParams, counties }: FiltersProps) => {
    // Price inputs need local state since user types then submits
    const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '');

    // Sync price inputs when URL params change (e.g. reset filters)
    useEffect(() => {
      setMinPrice(searchParams.get('min_price') || '');
      setMaxPrice(searchParams.get('max_price') || '');
    }, [searchParams]);

    // Derive all values directly from URL params
    const selectedFylke = searchParams.get('fylke') || '';
    const selectedKommuner = searchParams.getAll('kommune');
    const selectedCategoryParam = searchParams.get('category');
    const selectedSubcategory = searchParams.get('subcategory') || '';
    const productDate = searchParams.get('date') || '';
    const productStatus = searchParams.get('status') || '';

    // Derive communes from selected county
    const selectedCounty = counties.find((c: County) => c.fylkesnummer === selectedFylke);
    const communes = selectedCounty?.kommuner ?? [];

    // Derive main category object from URL (handles subcategory-only case too)
    const mainCategory = (() => {
        if (selectedCategoryParam) {
            return categoryObject.categories.find(item => item.maincategory === selectedCategoryParam) ?? '';
        }
        if (selectedSubcategory) {
            return categoryObject.categories.find(item => item.subcategories.some(s => s.name === selectedSubcategory)) ?? '';
        }
        return '';
    })();

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            removeSelectedFilter('fylke');
        } else {
            handleFilterChange('fylke', value);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            handleFilterChange('kommune', e.target.value);
        } else {
            removeSelectedFilter('kommune', e.target.value);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = JSON.parse(e.target.value);
        if (!value) {
            removeSelectedFilter('category');
        } else {
            handleFilterChange('category', value.maincategory);
        }
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleFilterChange('subcategory', e.target.value);
    };

    const handlePriceSubmit = () => {
        if (minPrice !== '') handleFilterChange('min_price', minPrice);
        if (maxPrice !== '') handleFilterChange('max_price', maxPrice);
    };

    const handleDateChange = (value: string) => {
        if (value === productDate) {
            removeSelectedFilter('date');
        } else {
            handleFilterChange('date', value);
        }
    };

    const handleStatusChange = (value: string) => {
        if (value === productStatus) {
            removeSelectedFilter('status');
        } else {
            handleFilterChange('status', value);
        }
    };

  return (
    <div>
      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Lokasjon</Accordion.Header>
          <Accordion.Body>
            <Form.Select
              aria-label="Velg fylke"
              className="mb-2"
              onChange={handleStateChange}
              value={selectedFylke}
            >
              <option value="">Velg fylke</option>
              {counties.length > 0 &&
                counties.map((county: County) => (
                  <option key={county.fylkesnummer} value={county.fylkesnummer}>
                    {county.fylkesnavn}
                  </option>
                ))}
            </Form.Select>
            {communes.length > 0 && (
              <div className={styles['commune-filter']}>
                {communes.map((kommune) => (
                  <Form.Check
                    onChange={handleCityChange}
                    checked={selectedKommuner.includes(kommune.kommunenavn)}
                    key={kommune.kommunenummer}
                    label={kommune.kommunenavn}
                    value={kommune.kommunenavn}
                    name={kommune.kommunenavn}
                  />
                ))}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Kategori</Accordion.Header>
          <Accordion.Body>
            <Form.Select
              aria-label="Velg hovedkategori"
              className="mb-2"
              onChange={handleCategoryChange}
              value={mainCategory !== '' ? JSON.stringify(mainCategory) : JSON.stringify('')}
            >
              <option value={JSON.stringify('')}>Velg hovedkategori</option>
              {categoryObject.categories.map((item) => (
                <option value={JSON.stringify(item)} key={item.maincategory}>
                  {item.maincategory}
                </option>
              ))}
            </Form.Select>
            {mainCategory !== '' &&
              <Form.Select
                aria-label="Velg underkategori"
                onChange={handleSubCategoryChange}
                value={selectedSubcategory}
              >
                <option value="">Velg underkategori</option>
                {mainCategory.subcategories.map(item => (
                  <option value={item.name} key={item.name}>{item.name}</option>
                ))}
              </Form.Select>
            }
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Pris</Accordion.Header>
          <Accordion.Body>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Min. pris"
                onChange={(e) => setMinPrice(e.target.value)}
                value={minPrice}
              />
              <InputGroup.Text>kr</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Maks. pris"
                onChange={(e) => setMaxPrice(e.target.value)}
                value={maxPrice}
              />
              <InputGroup.Text>kr</InputGroup.Text>
            </InputGroup>
            <Button variant="primary" type="button" onClick={handlePriceSubmit}>Filtrer</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Dato</Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Check type="radio" name="date" label="Siste 24 timer" value="today" checked={productDate === 'today'} onChange={() => handleDateChange('today')} />
              <Form.Check type="radio" name="date" label="Siste uken" value="this week" checked={productDate === 'this week'} onChange={() => handleDateChange('this week')} />
              <Form.Check type="radio" name="date" label="Siste måneden" value="this month" checked={productDate === 'this month'} onChange={() => handleDateChange('this month')} />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Stand</Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Check type="radio" value="nytt" name="status" label="Nytt" checked={productStatus === 'nytt'} onChange={() => handleStatusChange('nytt')} />
              <Form.Check type="radio" value="brukt" name="status" label="Brukt" checked={productStatus === 'brukt'} onChange={() => handleStatusChange('brukt')} />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default Filters;
