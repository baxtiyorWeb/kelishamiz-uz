import { get, isArray } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import KEYS from '../../export/keys';
import URLS from '../../export/urls';
import useInfiniteScrollQuery from '../../hooks/api/useInfiniteScrollQuery';
import ItemCard from './ItemCard';
const Recommenduem = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteScrollQuery({
			key: KEYS.product_list,
			url: URLS.product_list,
			elements: {
				search: '',
				size: 5,
				lang: '',
				categoryId: 0,
				districtId: 0,
				regionId: 0,
				paymentTypeId: 0,
				sellTypeId: 0,
				ownProducts: false,
				userId: 0,
				valueFilter: [],
				productIdList: [],
			},
		});

	const items = isArray(get(data, 'pages', []))
		? get(data, 'pages', []).flat()
		: [];

	return (
		<div className='mt-14'>
			<InfiniteScroll
				dataLength={items?.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={<h4>loading ...</h4>}
				style={{ width: '100%', paddingTop: 15 }}
				pullDownToRefreshThreshold={50}
			>
				<div className={`response_product_category grid grid-cols-5 gap-4  `}>
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
