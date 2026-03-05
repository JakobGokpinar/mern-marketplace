import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface SuggestionItem {
  url: string;
}

export default function Searchbar() {
  const navigate = useNavigate();
  const [productObjects, setProductObjects] = useState<ProductSuggestion[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isShow, setIsShow] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Flat list of all navigable items in render order
  const allItems = useMemo<SuggestionItem[]>(() => {
    if (!isShow) return [];
    const items: SuggestionItem[] = [{ url: `/search?q=${searchInput}` }];
    productObjects.forEach(p => items.push({ url: `/produkt/${p.id}` }));
    suggestedCategories.filter(Boolean).forEach(c => items.push({ url: `/search?category=${c}` }));
    return items;
  }, [isShow, searchInput, productObjects, suggestedCategories]);

  const close = () => {
    setIsShow(false);
    setFocusedIndex(-1);
  };

  useEffect(() => {
    // Reset keyboard focus when new results arrive
    setFocusedIndex(-1);
  }, [productObjects, suggestedCategories]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearch === '') {
      close();
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isShow) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (focusedIndex >= 0 && allItems[focusedIndex]) {
          e.preventDefault();
          navigate(allItems[focusedIndex].url);
          close();
        }
        break;
      case 'Escape':
        close();
        break;
    }
  };

  // Returns index in the flat allItems list for a given rendered item
  let itemCounter = 0;
  const nextIndex = () => itemCounter++;

  return (
    <div ref={containerRef} className={styles['searchbar-container']}>
      <Form action='/search' className={styles['searchbar-form']}>
        <InputGroup className={styles['searchbar-group']}>
          <Form.Control
            name='q'
            type='search'
            placeholder='Søk etter produkter...'
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete='off'
            aria-autocomplete='list'
            aria-expanded={isShow}
          />
          <Button type='submit' className={styles['searchbar-btn']}>
            <i className="fa-solid fa-magnifying-glass" />
          </Button>
        </InputGroup>
      </Form>

      {isShow && (
        <div className={styles['suggestion-box']} role="listbox">
          <div className={styles['suggestion-group']}>
            <p className={styles['suggestion-label']}>Søk</p>
            {(() => { const idx = nextIndex(); return (
              <a
                href={`/search?q=${searchInput}`}
                onClick={close}
                className={`${styles['suggestion-search-link']}${focusedIndex === idx ? ` ${styles['suggestion-item--focused']}` : ''}`}
                role="option"
                aria-selected={focusedIndex === idx}
              >
                <i className="fa-solid fa-magnifying-glass" />
                Finn flere resultater for <strong>'{searchInput}'</strong>
              </a>
            ); })()}
          </div>

          {productObjects.length > 0 && (
            <div className={styles['suggestion-group']}>
              <p className={styles['suggestion-label']}>Produkter</p>
              {productObjects.map((item) => {
                const idx = nextIndex();
                return (
                  <a
                    key={item.id}
                    href={`/produkt/${item.id}`}
                    onClick={close}
                    className={`${styles['suggestion-product']}${focusedIndex === idx ? ` ${styles['suggestion-item--focused']}` : ''}`}
                    role="option"
                    aria-selected={focusedIndex === idx}
                  >
                    {item.img && <img className={styles['suggestion-product-img']} src={item.img.location} alt="" />}
                    <span>{item.title}</span>
                  </a>
                );
              })}
            </div>
          )}

          {suggestedCategories.length > 0 && (
            <div className={styles['suggestion-group']}>
              <p className={styles['suggestion-label']}>Kategorier</p>
              {suggestedCategories.filter(Boolean).map((item) => {
                const idx = nextIndex();
                return (
                  <a
                    key={item}
                    href={`/search?category=${item}`}
                    onClick={close}
                    className={`${styles['suggestion-category']}${focusedIndex === idx ? ` ${styles['suggestion-item--focused']}` : ''}`}
                    role="option"
                    aria-selected={focusedIndex === idx}
                  >
                    <i className="fa-solid fa-tag" />
                    {item}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
