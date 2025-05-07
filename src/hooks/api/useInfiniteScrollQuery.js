import { useInfiniteQuery } from 'react-query';
import api from '../../config/auth/api';

const useInfiniteScrollQuery = ({
	key = 'infinite-query',
	url = '/',
	elements = {},
	initialPageParam = 1, // Start from page 1 instead of 0
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
			const page = pageParam;
			const limit = elements.limit || 10;
			const skip = (page - 1) * limit; // Ensure skip increments with page

			return api
				.post(
					url,
					{
						page, // Pass the current page
						limit, // Pass the limit
						skip, // Pass the calculated skip
						...elements, // Other parameters
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
				// Only increment the page if there are more items to fetch
				return lastPage?.length === elements.limit
					? allPages.length + 1
					: undefined;
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
