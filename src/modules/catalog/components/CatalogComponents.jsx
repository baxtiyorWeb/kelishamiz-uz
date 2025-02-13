/* eslint-disable react/prop-types */
import { get, isArray } from 'lodash';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import ItemCard from '../../../common/components/ItemCard';
import KEYS from '../../../export/keys';
import URLS from '../../../export/urls';
import useInfiniteScrollQuery from '../../../hooks/api/useInfiniteScrollQuery';
const Recommenduem = ({ addFilter }) => {
	const { id } = useParams();
	const [formatFilters, setFormatFilter] = useState([]);
	const [reData, setReData] = useState([]);

	useEffect(() => {
		const valueFilter = addFilter.map(item => ({
			...item,
			filter: Array.isArray(item.filter) ? item.filter : item.filter, // Ens uri ng filt er is always an array
		}));
		setFormatFilter(valueFilter);
	}, [addFilter]);

	useEffect(() => {
		const filterValue = formatFilters?.map(item => item?.filter);
		const minMaxValues = filterValue.filter(item => typeof item === 'object');

		const min = minMaxValues.map(item => item?.min);
		const max = minMaxValues.map(item => item?.max);

		setReData({ min, max });
	}, [formatFilters]);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteScrollQuery({
			key: `${KEYS.product_list}_${
				JSON.stringify(formatFilters) || JSON.stringify(reData)
			}/${id}`,
			url: URLS.product_list,
			elements: {
				search: '',
				size: 5,
				lang: '',
				categoryId: Number(id),
				districtId: 0,
				regionId: 0,
				paymentTypeId: 0,
				sellTypeId: 0,
				ownProducts: false,
				userId: 0,
				valueFilter: formatFilters,
				productIdList: [],
			},
		});

	const items = isArray(get(data, 'pages', []))
		? get(data, 'pages', []).flat()
		: [];

	return (
		<div>
			<InfiniteScroll
				dataLength={items?.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={<h4>loading ...</h4>}
				style={{ width: '100%', paddingTop: 15 }}
				pullDownToRefreshThreshold={50}
			>
				<div className={`response_product_category grid grid-cols-4 gap-4 `}>
					{items?.map((item, index) => (
						<ItemCard key={index} item={item} />
					))}
				</div>
			</InfiniteScroll>

			{isFetchingNextPage && 'loading ...'}
		</div>
	);
};

export default Recommenduem;
