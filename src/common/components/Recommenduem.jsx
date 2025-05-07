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
				categoryId: null, // Kategoriya identifikatori, default null
				minPrice: null, // Minimal narx, default null
				maxPrice: null, // Maksimal narx, default null
				title: '', // Sarlavha, default bo'sh string
				ownProduct: false, // Faqat o'zining mahsulotlari, default false
				properties: null, // Xususiyatlar, default null
				page: 1, // Sahifa raqami, default 1
				size: 10, // Mahsulotlar soni, default 10
				limit: 5, // Sahifa boshiga keladigan mahsulotlar soni, default 5
				sortBy: null, // Tartiblash bo'yicha, default null
				sortOrder: null, // Tartiblashning yo'nalishi, default null
				paymentType: null, // To'lov turi, default null
				currencyType: null, // Valyuta turi, default null
				negotiable: true, // Kelishish imkoniyati, default true
				skip: 0, // Skipp qilish, default 0
				regionId: null, // Hudud, default null
				districtId: null, // Tuman, default null
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
