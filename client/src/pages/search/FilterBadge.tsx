import React from "react";
import styles from "./FilterBadge.module.css";
import Icon from '../../components/icons/Icon';

interface CountySummary {
  fylkesnummer: string;
  fylkesnavn: string;
}

interface FilterBadgeProps {
  searchParams: URLSearchParams;
  removeSelectedFilter: (key: string, value?: string) => void;
  counties: CountySummary[];
}

const LABEL_MAP: Record<string, string> = {
  category: 'Kategori',
  subcategory: 'Underkategori',
  kommune: 'Kommune',
  fylke: 'Fylke',
  min_price: 'Min. pris',
  max_price: 'Maks. pris',
  date: 'Dato',
  status: 'Stand',
};

const VALUE_MAP: Record<string, string> = {
  today: 'Siste 24 timer',
  'this week': 'Siste uken',
  'this month': 'Siste måneden',
  nytt: 'Nytt',
  brukt: 'Brukt',
};

function formatValue(key: string, value: string): string {
  if (VALUE_MAP[value]) return VALUE_MAP[value];
  if (key === 'min_price' || key === 'max_price') return `${value} kr`;
  return value;
}

const FilterBadge = ({ searchParams, removeSelectedFilter, counties }: FilterBadgeProps) => {
  const params: { key: string; value: string; display: string }[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === 'q' || key === 'sort') continue;
    let displayValue = formatValue(key, value);
    if (key === 'fylke') {
      const county = counties.find(item => item.fylkesnummer === value);
      displayValue = county?.fylkesnavn || value;
    }
    const label = LABEL_MAP[key] || key;
    params.push({ key, value, display: `${label}: ${displayValue}` });
  }

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>, item: { key: string; value: string }) => {
    e.preventDefault();
    removeSelectedFilter(item.key, item.key === 'kommune' ? item.value : undefined);
  };

  return (
    <div className={styles['badge-container']}>
      {params.map((item, index) => (
        <span key={index} className={styles['filter-badge']}>
          {item.display}
          <button className={styles['filter-badge__close']} onClick={(e) => handleOnClick(e, item)}>
            <Icon name="xmark" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterBadge;
