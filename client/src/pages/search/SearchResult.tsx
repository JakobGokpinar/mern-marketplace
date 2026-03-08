import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styles from "./SearchResult.module.css";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Filters from "./Filters";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import FilterBadge from "./FilterBadge";
import Spinner from "react-bootstrap/Spinner";
import Icon from "../../components/icons/Icon";

import ListingCard from "../../components/listing-card/ListingCard";
import { ListingCardSkeletons } from "../../components/skeleton/ListingCardSkeleton";
import { queryKeys } from "../../lib/queryKeys";
import { searchListingsApi } from "../../services/productService";
import { useNorwayGeo } from "../../hooks/useNorwayGeo";
import type { Listing } from "../../types/listing";

const SearchResult = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: geoData } = useNorwayGeo();
  const counties = geoData?.districts || [];

  const [page, setPage] = useState(1);
  const [allListings, setAllListings] = useState<Listing[]>([]);

  const createQueryObject = () => {
    const queryObject: Record<string, string | string[]> = {};
    const kommuneArr: string[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (key === 'fylke') continue; // UI-only, not sent to backend
      if (key === 'kommune') {
        kommuneArr.push(value);
        queryObject["kommune"] = kommuneArr;
      } else {
        queryObject[key] = value;
      }
    }
    return queryObject;
  };

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.products.search(searchParams.toString(), page),
    queryFn: async () => {
      const res = await searchListingsApi(createQueryObject(), page);
      setAllListings(prev => page === 1 ? res.productArray : [...prev, ...res.productArray]);
      return res;
    },
  });

  // Reset to page 1 when search params change
  useEffect(() => {
    setPage(1);
    setAllListings([]);
  }, [searchParams]);

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const hasMore = page < totalPages;

  const handleFilterChange = (key: string, value: string) => {
    const params = searchParams;
    if (key !== 'kommune') params.delete(key);
    params.append(key, value);
    setSearchParams(params);
  };

  const removeSelectedFilter = (key: string, value?: string) => {
    const params = searchParams;
    if (key === 'fylke') {
      params.delete(key);
      params.delete('kommune');
    } else if (key === 'kommune') {
      const kommuneArr: string[] = [];
      for (const [queryKey, queryValue] of params.entries()) {
        if (queryKey === 'kommune' && queryValue !== value) kommuneArr.push(queryValue);
      }
      params.delete('kommune');
      kommuneArr.forEach(item => params.append('kommune', item));
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const resetFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const params = searchParams;
    for (const [key] of Array.from(searchParams.entries())) {
      if (key !== 'q') params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = searchParams;
    if (!value) {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    setSearchParams(params);
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(([key]) => key !== 'q' && key !== 'sort');

  return (
    <Container fluid className={styles['search-result-container']}>
      <Row className={styles['result-row']}>
        <Col lg={3} className="filters-column">
          {hasActiveFilters && (
            <Button variant="outline-danger" className="w-100 mb-4" onClick={resetFilters}>Nullstill filtre</Button>
          )}
          <Filters
            handleFilterChange={handleFilterChange}
            removeSelectedFilter={removeSelectedFilter}
            searchParams={searchParams}
            counties={counties}
          />
        </Col>

        <Col className="products-column" lg={8}>
          <div className={styles['top-row']}>
            <p>{totalCount} treff</p>
            <Form.Select
              className={styles['sort-select']}
              onChange={handleSorting}
              value={searchParams.get('sort') || ''}
            >
              <option value="">Mest relevant</option>
              <option value="newest">Nyeste først</option>
              <option value="oldest">Eldste først</option>
              <option value="price_asc">Laveste pris</option>
              <option value="price_desc">Høyeste pris</option>
            </Form.Select>
          </div>

          <div className={styles['middle-row']}>
            <FilterBadge searchParams={searchParams} removeSelectedFilter={removeSelectedFilter} counties={counties} />
          </div>

          <div className={styles['bottom-row']}>
            {isPending && page === 1 ? (
              <ListingCardSkeletons count={3} />
            ) : allListings.length === 0 ? (
              <div className={styles['empty-state']}>
                <Icon name="magnifying-glass" />
                <p>Ingen treff</p>
                <span>Prøv å endre søkeord eller fjern filtre</span>
              </div>
            ) : allListings.map((product) => (
              <div key={product._id}>
                <ListingCard
                  images={product.images}
                  title={product.title}
                  price={product.price}
                  id={product._id}
                  location={product.location}
                  sellerId={product.sellerId}
                />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className={styles['search-load-more']}>
              <Button
                variant="outline-primary"
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? <Spinner animation="border" size="sm" /> : 'Last inn flere'}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResult;
