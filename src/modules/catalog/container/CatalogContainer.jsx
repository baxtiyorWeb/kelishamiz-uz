import { get, isArray, isEqual } from 'lodash';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../../common/ui/BreadCrumbs';
import KEYS from '../../../export/keys';
import URLS from '../../../export/urls';
import useGetAllQuery from '../../../hooks/api/useGetAllQuery';
import CatalogComponents from '../components/CatalogComponents';

const CatalogContainer = () => {
	const { id } = useParams();
	const [selected, setSelected] = useState(null);
	const [value, setValue] = useState('');
	const [selectedFilter, setSelectedFilter] = useState({});
	const [addFilter, setAddFilter] = useState([]);
	const [initaliValue, setInitialValue] = useState(null);

	const handleFilter = item => {
		setAddFilter(prevFilters => {
			const existingFilter = prevFilters.find(
				filter => filter.propertyId === item.propertyId
			);

			if (existingFilter) {
				return prevFilters.map(filter =>
					filter.propertyId === item.propertyId
						? {
								...filter,
								filter: item?.filter,
						  }
						: filter
				);
			} else {
				return [
					...prevFilters,
					{
						...item,
						filter: item?.filter,
					},
				];
			}
		});

		setInitialValue(item);
	};

	const { data: categories } = useGetAllQuery({
		key: KEYS.category_list,
		url: URLS.category_list,
		params: {
			params: {
				page: 2,
				size: 10,
				parentId: null,
			},
		},
	});
	const { data } = useGetAllQuery({
		key: `/category/properties/${id}`,
		url: `/category/properties/${id}`,
		enabled: !!id,
	});

	const { data: getFilters } = useGetAllQuery({
		key: `/product/string-values?categoryId=${id}&propertyId=${get(
			selected,
			'id'
		)}`,
		url: `/product/string-values?categoryId=${id}&propertyId=${get(
			selected,
			'id'
		)}`,
		enabled: !!get(selected, 'id'),
	});

	const items = isArray(get(data, 'data.data', []))
		? get(data, 'data.data')
		: [];

	const categories_items = isArray(get(categories, 'data.data.content', []))
		? get(categories, 'data.data.content', [])
		: [];

	const filters = isArray(get(getFilters, 'data.data', []))
		? get(getFilters, 'data.data')
		: [];

	const { data: parentCategory } = useGetAllQuery({
		key: `${KEYS.category_list}_${id}`,
		url: `${URLS.category_list}?parentId=${id}`,
		enabled: !!id,
	});

	const subCategoryList = isArray(get(parentCategory, 'data.data.content', []))
		? get(parentCategory, 'data.data.content', [])
		: [];

	const filterTypeChange = (value, id, name, item) => {
		let minMax = value;

		const max = Number(value.max);
		const min = Number(value.min);

		if (minMax.max && minMax.min) {
			minMax = { min, max };
		} else if (minMax.max) {
			minMax = { min, max };
		} else if (minMax.min) {
			minMax = { min, max };
		}

		const isFilterType =
			get(item, 'valueTypeDto.typeName') === 'DOUBLE' ||
			get(item, 'valueTypeDto.typeName') === 'INTEGER'
				? {
						...minMax,
				  }
				: value;

		const filterObj = {
			propertyId: get(item, 'id'),
			valueTypeId: get(item, 'valueTypeDto.id'),
			filter: isFilterType,
		};

		if (Object.values(filterObj).every(Boolean)) {
			setSelectedFilter(filterObj);
		}

		setValue(value);
		const items = {
			id,
			value,
			name,
		};

		setSelected(items);
	};

	const handleFilterSelect = (selectedValue, item) => {
		setValue(prev => ({
			...prev,
			[item.id]: selectedValue, // Har bir filterni o‘z ID bo‘yicha saqlash
		}));

		filterTypeChange(selectedValue, get(item, 'id'), get(item, 'name'), item);
	};

	const renderFilter = item => {
		const typeName = item?.valueTypeDto?.typeName;

		switch (typeName) {
			case 'STRING':
				return (
					<input
						type='text'
						defaultValue={value[item?.id] || ''}
						placeholder={`${get(item, 'name')} ni kiriting`}
						className='w-full py-2 indent-2 outline-none border-[#FFBE1E] border my-1 rounded-md'
						onChange={e =>
							filterTypeChange(
								e.target.value,
								get(item, 'id'),
								get(item, 'name'),
								item
							)
						}
						onKeyDown={e => {
							if (e.keyCode === 13) {
								handleFilter(selectedFilter);
							}
						}}
					/>
				);
			case 'INTEGER':
			case 'DOUBLE':
				return (
					<div className='flex space-x-2'>
						<input
							type='number'
							placeholder='Min'
							className='w-full py-2 indent-2 outline-none border-[#FFBE1E] border my-1 rounded-md'
							onChange={e =>
								filterTypeChange(
									{
										min: e.target.value,
										max: initaliValue?.filter?.max || 0,
									},
									get(item, 'id'),
									get(item, 'name'),
									item
								)
							}
							onKeyDown={e => {
								if (e.keyCode === 13) {
									handleFilter(selectedFilter);
								}
							}}
						/>
						<input
							type='number'
							placeholder='Max'
							className='w-full py-2 indent-2 outline-none border-[#FFBE1E] border my-1 rounded-md'
							onChange={e =>
								filterTypeChange(
									{
										min: initaliValue?.filter?.min || 0,
										max: e.target.value,
									},
									get(item, 'id'),
									get(item, 'name'),
									item
								)
							}
							onKeyDown={e => {
								if (e.keyCode === 13) {
									handleFilter(selectedFilter);
								}
							}}
						/>
					</div>
				);
			case 'BOOLEAN':
				return (
					<select
						className='w-full py-2 indent-2 outline-none border-[#FFBE1E] border my-1 rounded-md'
						onChange={e =>
							filterTypeChange(
								e.target.value,
								get(item, 'id'),
								get(item, 'name'),
								item
							)
						}
						onKeyDown={e => {
							if (e.keyCode === 13) {
								handleFilter(selectedFilter);
							}
						}}
					>
						<option value='true'>True</option>
						<option value='false'>False</option>
					</select>
				);
			default:
				return (
					<input
						type='text'
						placeholder='Unknown type'
						className='w-full py-2 indent-2 outline-none border-[#FFBE1E] border my-1 rounded-md'
						onKeyDown={e => {
							if (e.keyCode === 13) {
								handleFilter(selectedFilter);
							}
						}}
					/>
				);
		}
	};

	const filteredFilters = filters?.filter(filterResult => {
		if (typeof filterResult !== 'string') return false;
		const filterName = filterResult.toLowerCase();
		const searchValue = value.toLowerCase();
		return filterName.includes(searchValue);
	});

	return (
		<>
			<div className='flex justify-between items-center space-x-2 '>
				{categories_items.map((item, index) => (
					<div
						key={index}
						className=' relative mb-8 border-b-2 pb-2 border-transparent hover:border-b-btnColor transition-all duration-300'
					>
						<Link
							key={get(item, 'id')}
							to={`/catalog/${get(item, 'id')}`}
							className='group flex    flex-col  items-center justify-center rounded-full   text-center text-sm '
						>
							<span className='mt-3 text-center font-poppins font-normal  not-italic  leading-[100%] text-textDarkColor group-hover:text-bgColor xs:text-xs  -bottom-8'>
								{get(item, 'name')}
							</span>
						</Link>
					</div>
				))}
			</div>
			<Breadcrumbs />
			<div className='grid grid-cols-12  gap-4 mt-2'>
				<div className='col-span-3  bg-gray-50'>
					<div className='col-span-1 bg-white rounded-lg shadow-md overflow-hidden'>
						{subCategoryList?.length !== 0 && (
							<h2 className='text-lg font-semibold p-4 bg-gray-100'>
								Sub Categories
							</h2>
						)}
						{subCategoryList?.map(item => (
							<Link
								key={get(item, 'id')}
								to={`/catalog/${get(item, 'id')}`}
								className='block px-4 py-2 hover:bg-gray-50 transition-colors duration-150 ease-in-out border-b last:border-b-0 text-sm'
							>
								{get(item, 'name')}
							</Link>
						))}
					</div>

					<div className='col-span-2 bg-white rounded-lg shadow-md overflow-hidden'>
						<h2 className='text-lg font-semibold p-2 bg-gray-100'>Saralash</h2>
						{items?.map(item => (
							<div
								key={get(item, 'id')}
								className='relative p-2 border-b last:border-b-0'
							>
								<div className='flex justify-start items-start flex-col'>
									<h3 className='font-medium text-gray-800 text-sm'>
										{get(item, 'name', 'item')}
									</h3>
									<div className='mt-2 w-full'>{renderFilter(item)}</div>
								</div>

								{item?.valueTypeDto?.typeName === 'STRING' &&
									filteredFilters?.map((filterResult, index) => {
										const filterId = get(item, 'id');

										return (
											!!selected &&
											value !== '' &&
											isEqual(get(selected, 'id'), filterId) && (
												<div
													key={index}
													className='absolute left-0 right-0 bottom-0 z-10 bg-white border-t flex items-center px-4 py-2 space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ease-in-out'
													onClick={() => {
														handleFilterSelect(filterResult, item);
														handleFilter(selectedFilter);
													}}
												>
													<Search size={18} className='text-gray-500' />
													<span className='text-gray-700'>{filterResult}</span>
												</div>
											)
										);
									})}
							</div>
						))}
					</div>
				</div>
				<div className='col-span-9 row-span-7 overflow-y-auto'>
					<CatalogComponents addFilter={addFilter} />
				</div>
			</div>
		</>
	);
};

export default CatalogContainer;
