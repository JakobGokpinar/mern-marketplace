import React, { useEffect, useState } from "react";
import styles from "./FilterBadge.module.css";

interface FilterParam {
  key: string;
  value: string;
}

interface CountySummary {
  fylkesnummer: string;
  fylkesnavn: string;
}

interface FilterBadgeProps {
  searchParams: URLSearchParams;
  removeSelectedFilter: (key: string, value?: string) => void;
  counties: CountySummary[] | false;
}

const FilterBadge = ({ searchParams, removeSelectedFilter, counties }: FilterBadgeProps) => {
  const [params, setParams] = useState<FilterParam[]>([]);

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>, item: FilterParam) => {
    e.preventDefault();
    if (item.key === "kommune") {
      removeSelectedFilter(item.key, item.value);
      return;
    }
    removeSelectedFilter(item.key);
  };

  useEffect(() => {
    const paramsArray = [];
    for (const [key, value] of searchParams.entries()) {
      if (key !== "q") {
        if (key === "fylke" && counties !== false) {
          const county = counties.find((item) => item.fylkesnummer === value);
          paramsArray.push({ key, value: county?.fylkesnavn || value });
        } else {
          paramsArray.push({ key, value });
        }
      }
    }
    setParams(paramsArray);
  }, [searchParams, counties]);

  return (
    <div className={styles['badge-container']}>
      {params.length > 0 && params.map((item, index) => (
        <span key={index} className={styles['filter-badge']}>
          {item.key}: {item.value}
          <button className={styles['filter-badge__close']} onClick={(e) => handleOnClick(e, item)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterBadge;
