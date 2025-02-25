import { useQuery } from 'react-query';
import api from '../../config/auth/api';

const useGetAllQuery = ({
	key = 'get-all',
	url = '/',
	params = {},
	showSuccessMsg = false,
	hideErrorMsg = false,
	enabled = true,
	options = {
		onSuccess: res => {
			if (showSuccessMsg) {
				return res;
			}
		},
		onError: data => {
			if (!hideErrorMsg) {
				return data;
			}
		},
	},
}) => {
	const { isLoading, isError, data, error, isFetching, refetch } = useQuery(
		key,
		() => api.get(url, params),
		{
			...options,
			enabled,
		}
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

export default useGetAllQuery;
