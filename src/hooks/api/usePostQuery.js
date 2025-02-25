import { useMutation, useQueryClient } from 'react-query';
import api from '../../config/auth/api';

const postRequest = (url, attributes, config = {}) =>
	api.post(url, attributes, config);

const usePostQuery = ({ hideSuccessToast = false, listKeyId = null }) => {
	const queryClient = useQueryClient();

	const { mutate, isLoading, isError, error, isFetching } = useMutation(
		({ url, attributes, config = {} }) => postRequest(url, attributes, config),
		{
			onSuccess: data => {
				if (!hideSuccessToast) {
					return data;
				}

				if (listKeyId) {
					queryClient.invalidateQueries(listKeyId);
				}
			},
			onError: err => {
				return err;
			},
		}
	);

	return {
		mutate,
		isLoading,
		isError,
		error,
		isFetching,
	};
};
export default usePostQuery;
