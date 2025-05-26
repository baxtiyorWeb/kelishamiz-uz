import React from "react";
import useGetAllQuery from "./../../hooks/api/useGetAllQuery";
import URLS from "./../../export/urls";
import KEYS from "./../../export/keys";
const FavouritesComponents = () => {
  const [favourites, setFavourites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const { data, isLoading, isError } = useGetAllQuery({
    key: KEYS.products_liked,
    url: URLS.products_liked,
  });

  console.log("FavouritesComponents data", data);

  return <div>FavouritesComponents</div>;
};

export default FavouritesComponents;
