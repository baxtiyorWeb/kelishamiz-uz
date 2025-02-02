import { useQuery } from 'react-query';
import api from '../../config/auth/api';

const fetchRequest = (url, params) => api.get(url, params);

const useGetOneQuery = ({
	id = null,
	key = 'get-one',
	url = 'test',
	enabled = true,
	params = {},
	showSuccessMsg = false,
	showErrorMsg = true,
}) => {
	const { isLoading, isError, data, error, refetch } = useQuery(
		[key, id],
		() => fetchRequest(`${url}`, params),
		{
			onSuccess: res => {
				if (showSuccessMsg) {
					return res;
				}
			},
			onError: err => {
				if (showErrorMsg) {
					return err;
				}
			},
			enabled,
		}
	);

	return {
		isLoading,
		isError,
		data,
		error,
		refetch,
	};
};

export default useGetOneQuery;
