import React, { useEffect, useState } from 'react';
import ProductCard from '../../Component/ProductCard/ProductCard.js';
import { instanceAxs } from '../../config/api.js';
import "./Menu.css";
import { useSelector } from 'react-redux';

const Menu = () => {
    const user = useSelector(state => state.user.user);
    const [productArray, setProductArray] = useState([]);

    useEffect(() => {
        instanceAxs.get('/search').then(response => {
            setProductArray(response.data.productArray || [])
        })
    }, [user])
    
    return (
        <div className='homepage'>
            {productArray.length > 0 ? (
                <div className='homepage-grid'>
                    {productArray.map((product, index) => (
                        <ProductCard
                            key={product._id || index}
                            images={product.annonceImages}
                            title={product.title}
                            price={product.price}
                            id={product._id}
                            location={product.location}
                            description={product.description}
                            isFavorite={product.isFavorite}
                            user={user}
                            sellerId={product.sellerId}
                        />
                    ))}
                </div>
            ) : (
                <div className='homepage-empty'>
                    <i className="fa-solid fa-box-open" />
                    <p>Ingen annonser ennå</p>
                </div>
            )}
        </div>
    )
}

export default Menu;
