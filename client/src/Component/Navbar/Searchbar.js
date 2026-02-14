import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Searchbar.css';

import { InputGroup, Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form';

import { instanceAxs } from '../../config/api.js'

export default function Searchbar() {

    const [productObjects, setProductObjects] = useState([])
    const [suggestedCategories, setSuggestedCategories] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [isShow, setIsShow] = useState(false);

    const handleInput = (e) => {
        let input = e.target.value;
        setSearchInput(input)
    }

    const handleLinkClick = () => {
        setIsShow(false)
    }

    useEffect(() => {
        if(searchInput === '') {
            setIsShow(false)
            return;
        };

        instanceAxs.post('/searchproduct', {q: searchInput})
        .then(response => {
                var responseData = response.data.productArray.map(item => {
                return {title: item.title, img: item.annonceImages[0], id: item._id}
            })
            const suggestedCat = response.data.categories.slice(0,3);
            responseData = responseData.slice(0,3);

            setProductObjects(responseData)
            setSuggestedCategories(suggestedCat)
            setIsShow(true)
        })        
    }, [searchInput])

  return (
    <div>
            <Form action='/search'>
                <InputGroup>
                        <Form.Control name='q' type='search' placeholder='Søk produkt eller kategori' 
                            style={{width: 250}} onChange={handleInput} autoComplete='off'
                        />
                        <Button type='search'> 
                            Søk
                            <i className="fa-solid fa-magnifying-glass fa-sm mx-2"/>
                        </Button>
                </InputGroup>
            </Form>

            {isShow &&
                <div id="suggestionBox" className='search-suggestion-box border'>    

                    <div id='searchWord' className='mb-4'>
                        <p className='suggestion-component__title mb-1'>Søk</p>
                        <Link to={`/search?q=${searchInput}`} onClick={handleLinkClick}>
                            Finn flere resultater for '{searchInput}'
                        </Link>
                    </div>

                    {productObjects.length > 0 &&       
                            <div id='searchProduct' className='suggestion-component'>
                                    <p className='suggestion-component__title'>Produkter</p>
                                    {productObjects.map((item, index) => {
                                        return(
                                            <Link to={`/produkt/${item.id}`} key={index} onClick={handleLinkClick}>
                                                <div className='suggestion-component__content' key={item.title}>
                                                    <p style={{margin: 0}}>{item.title}</p>
                                                    <img className='suggestion-component__img' src={item.img.location} alt="annonce"/>
                                                </div>
                                            </Link>
                                        )
                                    })}
                            </div>
                    }

                    {suggestedCategories.length > 0 &&       
                            <div id='searchProduct' className='suggestion-component'>
                                    <p className='suggestion-component__title'>Kategorier</p>
                                    {suggestedCategories.filter(item => item !== null && item !== undefined).map((item, index) => {
                                        return(
                                            <Link to={`search?category=${item}`} key={index} onClick={handleLinkClick}>
                                                <div className='category-suggestion-component__content'>
                                                    {item}
                                                </div>
                                            </Link>
                                        )
                                    })}
                            </div>
                    }        
                </div>     
            }
    </div>
  )
}
