import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Searchbar.module.css';

import { InputGroup, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { instanceAxs } from '../../lib/axios';
import { useDebounce } from '../../hooks/useDebounce';

interface ProductSuggestion {
  title: string;
  img?: { location: string };
  id: string;
}

export default function Searchbar() {
  const [productObjects, setProductObjects] = useState<ProductSuggestion[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isShow, setIsShow] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleLinkClick = () => {
    setIsShow(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearch === '') {
      setIsShow(false);
      return;
    }

    instanceAxs.post('/searchproduct', { q: debouncedSearch })
      .then(response => {
        const responseData = (response.data.productArray as Array<{ title: string; annonceImages?: Array<{ location: string }>; _id: string }>).map(item => ({
          title: item.title,
          img: item.annonceImages?.[0],
          id: item._id,
        })).slice(0, 3);
        const suggestedCat = (response.data.categories as string[]).slice(0, 3);

        setProductObjects(responseData);
        setSuggestedCategories(suggestedCat);
        setIsShow(true);
      });
  }, [debouncedSearch]);

  return (
    <div ref={containerRef}>
      <Form action='/search' className={styles['searchbar-form']}>
        <InputGroup className={styles['searchbar-group']}>
          <Form.Control
            name='q'
            type='search'
            placeholder='Søk etter produkter...'
            onChange={handleInput}
            autoComplete='off'
          />
          <Button type='submit' className={styles['searchbar-btn']}>
            <i className="fa-solid fa-magnifying-glass" />
          </Button>
        </InputGroup>
      </Form>

      {isShow && (
        <div id="suggestionBox" className={`${styles['search-suggestion-box']} border`}>
          <div id='searchWord' className='mb-4'>
            <p className={`${styles['suggestion-title']} mb-1`}>Søk</p>
            <Link to={`/search?q=${searchInput}`} onClick={handleLinkClick}>
              Finn flere resultater for '{searchInput}'
            </Link>
          </div>

          {productObjects.length > 0 && (
            <div id='searchProduct' className={styles['suggestion-group']}>
              <p className={styles['suggestion-title']}>Produkter</p>
              {productObjects.map((item, index) => (
                <Link to={`/produkt/${item.id}`} key={index} onClick={handleLinkClick}>
                  <div className={styles['suggestion-content']} key={item.title}>
                    <p style={{ margin: 0 }}>{item.title}</p>
                    <img className={styles['suggestion-img']} src={item.img?.location} alt="annonce" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {suggestedCategories.length > 0 && (
            <div id='searchCategories' className={styles['suggestion-group']}>
              <p className={styles['suggestion-title']}>Kategorier</p>
              {suggestedCategories.filter(item => item != null).map((item, index) => (
                <Link to={`search?category=${item}`} key={index} onClick={handleLinkClick}>
                  <div className={styles['category-suggestion-content']}>
                    {item}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
