import React, { useEffect, useState } from "react";
import "./FilterBadge.css";
import Chip from "@mui/material/Chip";

const FilterBadge = ({ searchParams, removeSelectedFilter, counties }) => {
  const [params, setParams] = useState([]);

  const handleOnClick = (e, item) => {
    e.preventDefault();
    let key = item.key;
    let value = item.value;

    if (key === "kommune") {
      removeSelectedFilter(key, value);
      return;
    }
    removeSelectedFilter(key);
  };

  const getParams = () => {
    const paramsArray = [];
    for (const [key, value] of searchParams.entries()) {
      if (key !== "q") {
        if (key === "fylke" && counties !== false) {
          const county = counties.find((item) => item.fylkesnummer === value);
          paramsArray.push({ key: key, value: county.fylkesnavn });
        } else {
          paramsArray.push({ key: key, value: value });
        }
      }
    }
    setParams(paramsArray);
  };

  useEffect(() => {
    getParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, counties]);

  return (
    <div className="badge-container">
      {params.length > 0 &&
        params.map((item, index) => {
          let msg = item.key + ": " + item.value;
          return (
            <Chip
              key={index}
              label={msg}
              style={{ margin: 5}}
              onDelete={(e) => handleOnClick(e, item)}
            />
          );
        })}
    </div>
  );
};

export default FilterBadge;
