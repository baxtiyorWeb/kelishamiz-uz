import { useMutation, useQueryClient } from "react-query";
import api from "../../config/auth/api";

const putRequest = (url, attributes) => api.put(url, attributes);

const usePutQuery = ({ hideSuccessToast = false, listKeyId = null }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, error, isFetching } = useMutation(
    ({ url, attributes }) => putRequest(url, attributes),
    {
      onSuccess: (data) => {
        if (!hideSuccessToast) {
          return data;
        }

        if (listKeyId) {
          queryClient.invalidateQueries(listKeyId);
        }
      },
      onError: (err) => {
        return err;
      },
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
export default usePutQuery;
