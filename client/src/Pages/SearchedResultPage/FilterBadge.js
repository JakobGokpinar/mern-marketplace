import React, { useEffect, useState } from "react";
import "./FilterBadge.css";

const FilterBadge = ({ searchParams, removeSelectedFilter, counties }) => {
  const [params, setParams] = useState([]);

  const handleOnClick = (e, item) => {
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
    <div className="badge-container">
      {params.length > 0 && params.map((item, index) => (
        <span key={index} className="filter-badge">
          {item.key}: {item.value}
          <button className="filter-badge__close" onClick={(e) => handleOnClick(e, item)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterBadge;