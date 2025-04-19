import { useInfiniteQuery } from 'react-query';
import api from '../../config/auth/api';

const useInfiniteScrollQuery = ({
	key = 'infinite-query',
	url = '/',
	elements = {},
	initialPageParam = 0,
	showSuccessMsg = false,
	hideErrorMsg = false,
	enabled = true,

	options = {
		onSuccess: data => {
			if (showSuccessMsg) {
				return data;
			}
		},
		onError: error => {
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
		({ pageParam = initialPageParam }) => {
			const page = pageParam; // `pageParam`ni oling
			const limit = elements.limit || 10; // Limitni olish (agar elements.da limit yo'q bo'lsa, default 10)

			const skip = (page - 1) * limit; // `skip`ni sahifa va limitga moslashtiring

			return api
				.post(
					url,
					{
						page, // Sahifa raqami
						limit, // Limit
						skip, // Offset
						...elements, // Boshqa parametrlar
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
						},
					}
				)
				.then(response => response?.data?.content)
				.catch(error => {
					console.error('Error fetching data:', error);
					throw error;
				});
		},
		{
			getNextPageParam: (lastPage, allPages) => {
				return lastPage?.length > 0 ? allPages?.length + 1 : undefined;
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
