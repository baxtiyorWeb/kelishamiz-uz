import { useInfiniteQuery } from "react-query";
import api from "../../config/auth/api";

const useInfiniteScrollQuery = ({
  key = "infinite-query",
  url = "/",
  initialPageParam = 0,
  showSuccessMsg = false,
  hideErrorMsg = false,
  enabled = true,
  options = {
    onSuccess: (data) => {
      if (showSuccessMsg) {
        return data;
      }
    },
    onError: (error) => {
      if (!hideErrorMsg) {
        return error;
      }
    },
  },
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
    isFetchingNextPage,
  } = useInfiniteQuery(
    key,
    ({ pageParam = initialPageParam }) =>
      api
        .post(
          url,
          {
            search: "",
            page: pageParam,
            size: 5,
            lang: "",
            categoryId: 0,
            districtId: 0,
            regionId: 0,
            paymentTypeId: 0,
            sellTypeId: 0,
            ownProducts: false,
            userId: 0,
            valueFilter: [],
            productIdList: [],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
        .then((response) => response?.data?.data)
        .catch((error) => {
          console.error("Error fetching data:", error);
          throw error;
        }),

    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage?.length ? allPages?.length : undefined;
      },
      enabled,
      ...options,
    }
  );

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
  };
};

export default useInfiniteScrollQuery;
