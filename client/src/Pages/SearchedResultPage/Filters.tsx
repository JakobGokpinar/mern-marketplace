import React, { useState } from 'react'
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
  counties: County[] | false;
  categories?: { categories: string[]; subCategories: string[] } | false;
}

const Filters = ({ handleFilterChange, removeSelectedFilter, searchParams, counties }: FiltersProps) => {
    // Price inputs need local state since user types then submits
    const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '');

    // Derive all values directly from URL params
    const selectedFylke = searchParams.get('fylke') || '';
    const selectedKommuner = searchParams.getAll('kommune');
    const selectedCategoryParam = searchParams.get('category');
    const selectedSubcategory = searchParams.get('subcategory') || '';
    const productDate = searchParams.get('date') || '';
    const productStatus = searchParams.get('status') || '';

    // Derive communes from selected county
    const selectedCounty = counties !== false ? counties.find((c: County) => c.fylkesnummer === selectedFylke) : undefined;
    const communes = selectedCounty?.kommuner ?? [];

    // Derive main category object from URL (handles subcategory-only case too)
    const mainCategory = (() => {
        if (selectedCategoryParam) {
            return categoryObject.categories.find(item => item.maincategory === selectedCategoryParam) ?? '';
        }
        if (selectedSubcategory) {
            return categoryObject.categories.find(item => item.subcategories.includes(selectedSubcategory)) ?? '';
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

    const handleDateChange = (e: React.FormEvent<HTMLFormElement>) => {
        const target = e.target as HTMLInputElement;
        handleFilterChange('date', target.value);
    };

    const handleStatusChange = (e: React.FormEvent<HTMLFormElement>) => {
        const target = e.target as HTMLInputElement;
        handleFilterChange('status', target.value);
    };

  return (
    <div>
      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Lokasjon</Accordion.Header>
          <Accordion.Body>
            <Form.Select
              aria-label="state-selection"
              className="mb-2"
              onChange={handleStateChange}
              value={selectedFylke}
            >
              <option value="">Velg en Fylke</option>
              {counties !== false && counties.length > 0 &&
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
              aria-label="maincategory-selection"
              className="mb-2"
              onChange={handleCategoryChange}
              value={mainCategory !== '' ? JSON.stringify(mainCategory) : JSON.stringify('')}
            >
              <option value={JSON.stringify('')}>Velg en hovedkategori</option>
              {categoryObject.categories.map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>
                  {item.maincategory}
                </option>
              ))}
            </Form.Select>
            {mainCategory !== '' &&
              <Form.Select
                aria-label="subcategory-selection"
                onChange={handleSubCategoryChange}
                value={selectedSubcategory}
              >
                <option value="">Velg en under kategori</option>
                {mainCategory.subcategories.map(item => (
                  <option value={item} key={item}>{item}</option>
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
                placeholder="min. pris"
                onChange={(e) => setMinPrice(e.target.value)}
                value={minPrice}
              />
              <InputGroup.Text>kr</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="max. pris"
                onChange={(e) => setMaxPrice(e.target.value)}
                value={maxPrice}
              />
              <InputGroup.Text>kr</InputGroup.Text>
            </InputGroup>
            <Button variant="primary" type="button" onClick={handlePriceSubmit}>Search</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Dato</Accordion.Header>
          <Accordion.Body>
            <Form onChange={handleDateChange}>
              <Form.Check type="radio" name="date" label="Siste 24 timer" value="today" checked={productDate === 'today'} onChange={() => {}} />
              <Form.Check type="radio" name="date" label="I uke" value="this week" checked={productDate === 'this week'} onChange={() => {}} />
              <Form.Check type="radio" name="date" label="I month" value="this month" checked={productDate === 'this month'} onChange={() => {}} />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className={styles['filter-accordion']}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Status</Accordion.Header>
          <Accordion.Body>
            <Form onChange={handleStatusChange}>
              <Form.Check type="radio" value="nytt" name="status" label="Nytt" checked={productStatus === 'nytt'} onChange={() => {}} />
              <Form.Check type="radio" value="brukt" name="status" label="Brukt" checked={productStatus === 'brukt'} onChange={() => {}} />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default Filters;
