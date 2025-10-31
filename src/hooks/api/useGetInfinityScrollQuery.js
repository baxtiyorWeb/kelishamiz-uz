import { useInfiniteQuery } from "react-query";
import api from "../../config/auth/api";

const useInfiniteScrollQuery = ({
  key = "infinite-query",
  url = "/",
  elements = {},
  initialPageParam = 1,
  showSuccessMsg = false,
  hideErrorMsg = false,
  enabled = true,
  options = {
    onSuccess: (data) => {
      if (showSuccessMsg) return data;
    },
    onError: (error) => {
      if (!hideErrorMsg) return error;
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
    ({ pageParam = initialPageParam }) => {
      const page = pageParam;
      const limit = elements.limit || 8;
      const skip = (page - 1) * limit;

      return api
        .get(url, {
          params: {
            page,
            pageSize: limit,
            ...elements,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response?.data)
        .catch((error) => {
          console.error("Error fetching data:", error);
          throw error;
        });
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage?.content?.total || 0;
        const itemsFetched = allPages.flatMap(
          (p) => p?.content?.data || []
        ).length;
        return itemsFetched < totalItems ? allPages.length + 1 : undefined;
      },
      enabled,
      ...options,
    }
  );

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    data,
    fetchNextPage: loadMore,
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
