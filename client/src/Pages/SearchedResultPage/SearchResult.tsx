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

import ProductCard from "../../components/ProductCard/ProductCard";
import { ProductGridSkeleton } from "../../components/Skeleton/ProductCardSkeleton";
import { queryKeys } from "../../lib/queryKeys";
import { searchProductsApi } from "../../services/productService";
import { useNorwayGeo } from "../../hooks/useNorwayGeo";
import type { Product } from "../../types/product";

const SearchResult = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: geoData } = useNorwayGeo();
  const counties = geoData?.districts || [];

  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const createQueryObject = () => {
    const queryObject: Record<string, string | string[]> = {};
    const kommuneArr: string[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (key === 'kommune') {
        kommuneArr.push(value);
        queryObject["kommune"] = kommuneArr;
      } else {
        queryObject[key] = value;
      }
    }
    return queryObject;
  };

  const paramsKey = Object.fromEntries(searchParams.entries());

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.products.search(paramsKey, page),
    queryFn: async () => {
      const res = await searchProductsApi(createQueryObject(), page);
      setAllProducts(prev => page === 1 ? res.productArray : [...prev, ...res.productArray]);
      return res;
    },
  });

  // Reset to page 1 when search params change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [searchParams]);

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const hasMore = page < totalPages;

  const [sortedProducts, setSortedProducts] = useState<Product[] | null>(null);
  const displayProducts = sortedProducts || allProducts;

  // Reset sorting when products change
  useEffect(() => {
    setSortedProducts(null);
  }, [allProducts]);

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
      const kommuneArr = [];
      for (const [queryKey, queryValue] of params.entries()) {
        if (queryKey === 'kommune' && queryValue !== value) kommuneArr.push(queryValue);
      }
      params.delete('kommune');
      kommuneArr.map(item => params.append('kommune', item));
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
    e.preventDefault();
    const value = e.target.value;
    const products = [...allProducts];
    switch (value) {
      case "price_asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "published-first":
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "published-last":
        products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        setSortedProducts(null);
        return;
    }
    setSortedProducts(products);
  };

  return (
    <Container fluid className={styles['search-result-container']}>
      <Row className={styles['result-row']}>
        <Col lg={3} className="filters-column">
          <Button variant="outline-danger" className="w-100 mb-4" onClick={resetFilters}>Reset Filters</Button>
          <Filters
            handleFilterChange={handleFilterChange}
            removeSelectedFilter={removeSelectedFilter}
            searchParams={searchParams}
            counties={counties.length > 0 && counties}
          />
        </Col>

        <Col className="products-column" lg={8}>
          <div className={styles['top-row']}>
            <p>{totalCount} treff</p>
            <Form.Select style={{ maxWidth: 200 }} onChange={handleSorting}>
              <option value="mest-relevant">Mest Relevant</option>
              <option value="published-first">Eldste først</option>
              <option value="published-last">Nyeste først</option>
              <option value="price_asc">Pris lav til høy</option>
              <option value="price_desc">Pris høy til lav</option>
            </Form.Select>
          </div>

          <div className={styles['middle-row']}>
            <FilterBadge searchParams={searchParams} removeSelectedFilter={removeSelectedFilter} counties={counties.length > 0 && counties} />
          </div>

          <div className={styles['bottom-row']}>
            {isPending && page === 1 ? (
              <ProductGridSkeleton count={6} />
            ) : displayProducts.map((product) => (
              <div key={product._id}>
                <ProductCard
                  images={product.images}
                  title={product.title}
                  price={product.price}
                  id={product._id}
                  location={product.location}
                  isFavorite={product.isFavorite}
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
