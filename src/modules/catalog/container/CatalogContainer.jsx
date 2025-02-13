import { get, isArray, isEqual } from 'lodash';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

	const renderFilter = item => {
		const typeName = item?.valueTypeDto?.typeName;

		switch (typeName) {
			case 'STRING':
				return (
					<input
						type='text'
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
		<div className='mt-10'>
			<div className='grid grid-cols-12 grid-rows-7 gap-4'>
				<div className='row-span-7 col-span-3'>
					{subCategoryList?.map(item => {
						return (
							<div key={get(item, 'id')}>
								<Link to={`/catalog/${get(item, 'id')}`}>
									{get(item, 'name')}
								</Link>
							</div>
						);
					})}
					<div className='border px-1'>
						{items?.map(item => (
							<div
								key={get(item, 'id')}
								className='grid grid-cols-2 relative justify-between items-start p-2'
							>
								<h1 className='font-normal text-[15px]'>
									{get(item, 'name', 'item')}
								</h1>
								{renderFilter(item)}

								{item?.valueTypeDto?.typeName === 'STRING' &&
									filteredFilters?.map((filterResult, index) => {
										const filterId = get(item, 'id');

										return (
											!!selected &&
											value !== '' &&
											isEqual(get(selected, 'id'), filterId) && (
												<div
													key={index}
													className='absolute -bottom-7 z-10 w-[93%] h-10 bg-white flex justify-start px-2 space-x-3 items-center border cursor-pointer hover:bg-gray-100'
													onClick={() => {
														handleFilter(selectedFilter);
													}}
												>
													<Search size={15} /> <span>{filterResult}</span>
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
		</div>
	);
};

export default CatalogContainer;
