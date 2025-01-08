import { useMutation, useQueryClient } from "react-query";
import api from "../../config/auth/api";

const deleteRequest = (url) => api.delete(url);

const useDeleteQuery = ({ listKeyId = null }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, error, isFetching } = useMutation(
    ({ url }) => deleteRequest(url),
    {
      onSuccess: (data) => {
        if (listKeyId) {
          queryClient.invalidateQueries(listKeyId);
        }
      },
      onError: (data) => {},
    },
  );

  return {
    mutate,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
export default useDeleteQuery;
