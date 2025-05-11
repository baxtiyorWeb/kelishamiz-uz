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
      const limit = elements.limit || 10;
      const skip = (page - 1) * limit;

      return api
        .get(url, {
          params: {
            page,
            limit,
            skip,
            ...elements,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response?.data?.content)
        .catch((error) => {
          console.error("Error fetching data:", error);
          throw error;
        });
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        // Only increment page if last page has enough items
        return lastPage?.length === elements.limit
          ? allPages.length + 1
          : undefined;
      },
      enabled,
      ...options,
    }
  );

  // Prevent multiple fetches if data is already being fetched
  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    data,
    fetchNextPage: loadMore, // Use the custom loadMore function
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
