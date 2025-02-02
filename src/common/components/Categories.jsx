import { get, isArray } from 'lodash';
import { Link } from 'react-router-dom';
import KEYS from './../../export/keys';
import URLS from './../../export/urls';
import useGetAllQuery from './../../hooks/api/useGetAllQuery';
const Categories = () => {
	const { data } = useGetAllQuery({
		key: KEYS.category_list,
		url: URLS.category_list,
		params: {
			params: {
				page: 2,
				size: 10,
			},
		},
	});

	const items = isArray(get(data, 'data.data.content', []))
		? get(data, 'data.data.content', [])
		: [];

	return (
		<div className='flex justify-between items-center px-32'>
			{items.map((item, index) => (
				<div key={index}>
					<Link
						key={get(item, 'id')}
						to={`/catalog/${get(item, 'id')}`}
						className='group flex   flex-col  items-center justify-center rounded-full   text-center text-sm '
					>
						<img
							src={`data:image/png;base64,${item?.file?.fileBase64}`}
							className='xs:p-1 my-2 xl:w-[80px_!important] xl:h-[80px_!important] h-[100px] w-[100px] rounded-full  border border-bgColor object-cover p-[10px]   xs:h-[60px_!important] xs:w-[60px_!important]'
							alt=''
						/>
						<span className='mt-3 text-center font-poppins font-normal  not-italic  leading-[100%] text-textDarkColor group-hover:text-bgColor xs:text-xs'>
							{get(item, 'name')}
						</span>
					</Link>
				</div>
			))}
		</div>
	);
};

export default Categories;
