import React from "react";
import styles from "./FilterBadge.module.css";
import Icon from '../../components/icons/Icon';

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
  const params: FilterParam[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === 'q') continue;
    if (key === 'fylke' && counties !== false) {
      const county = counties.find(item => item.fylkesnummer === value);
      params.push({ key, value: county?.fylkesnavn || value });
    } else {
      params.push({ key, value });
    }
  }

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>, item: FilterParam) => {
    e.preventDefault();
    removeSelectedFilter(item.key, item.key === 'kommune' ? item.value : undefined);
  };

  return (
    <div className={styles['badge-container']}>
      {params.map((item, index) => (
        <span key={index} className={styles['filter-badge']}>
          {item.key}: {item.value}
          <button className={styles['filter-badge__close']} onClick={(e) => handleOnClick(e, item)}>
            <Icon name="xmark" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterBadge;
