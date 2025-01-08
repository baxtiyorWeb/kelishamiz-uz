import { useQuery } from "react-query";
import api from "../../config/auth/api";

const usePaginateQuery = ({
  key = "get-all",
  url = "/",
  page = 0,
  params = {},
  showSuccessMsg = false,
  showErrorMsg = false,
  enabled = true,
}) => {
  const { isLoading, isError, data, error, isFetching, refetch } = useQuery(
    [key, page, params],
    () => api.get(`${url}?page=${page}`, params),
    {
      enabled,
      keepPreviousData: true,
      onSuccess: (res) => {
        if (showSuccessMsg) {
          return res;
        }
      },
      onError: (err) => {
        if (showErrorMsg) {
          return err;
        }
      },
    },
  );

  return {
    isLoading,
    isError,
    data,
    error,
    isFetching,
    refetch,
  };
};

export default usePaginateQuery;
