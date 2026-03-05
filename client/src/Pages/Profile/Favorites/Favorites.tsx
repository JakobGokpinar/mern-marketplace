import styles from "./Favorites.module.css";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Spinner from 'react-bootstrap/Spinner';
import { getFavoritesApi } from "../../../services/favoriteService";
import { queryKeys } from "../../../lib/queryKeys";

const Favorites = () => {
  const { data: favoritesArray = [], isPending } = useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: getFavoritesApi,
  });

  return (
    <div className={styles['favorites-container']}>
      <Breadcrumb>
        <Breadcrumb.Item href='/min-konto'>Min konto</Breadcrumb.Item>
        <Breadcrumb.Item href='/profil' active>Favoritter</Breadcrumb.Item>
      </Breadcrumb>
      {isPending ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : (
        <div className={styles['favorites-content']}>
          {favoritesArray.length > 0 ? favoritesArray.map(product => (
            <div className={styles['favorites-product']} key={product._id || product.title}>
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
          )) : (
            <p>Du har ingen favoritte annonser</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
