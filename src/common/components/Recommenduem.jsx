import { get, isArray } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import KEYS from '../../export/keys';
import URLS from '../../export/urls';
import useInfiniteScrollQuery from '../../hooks/api/useInfiniteScrollQuery';
import ItemCard from './ItemCard';
const Recommenduem = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteScrollQuery({
			key: KEYS.product_filter,
			url: URLS.product_filter,
			elements: {
				categoryId: 1,
				minPrice: 10000000,
				maxPrice: 13000000,
				title: 'Redmi',
				ownProduct: false,
				properties: null,
				page: 1, // Sahifa raqami
				limit: 5, // Sahifa boshiga keladigan mahsulotlar soni
				sortBy: 'price',
				sortOrder: 'DESC',
				paymentType: 'Pullik',
				currencyType: 'UZS',
				negotiable: true,
				regionId: 0,
				districtId: 0,
			},
		});

	const items = isArray(get(data, 'pages', []))
		? get(data, 'pages', []).flat()
		: [];

	console.log(items);

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
