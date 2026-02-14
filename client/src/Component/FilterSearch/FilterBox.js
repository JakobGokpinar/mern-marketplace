import React, { useState } from 'react';
import Header from '../../Pages/SearchedResultPage/FilterComponents/Header';

function FilterBox(props) {

    const [isVisible, setVisible] = useState(true);

    function changeVisibility(){
        let visible = !isVisible;
        setVisible(visible)
    }
    return (
        <div className='category border rounded filterContainer'>
            <div onClick={changeVisibility}><Header title={props.title} ></Header></div>
            {isVisible &&
                <div>
                    {props.content}
                </div>
            }
        </div>
    );
}

export default FilterBox;