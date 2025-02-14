'use client';

import { get, isArray } from 'lodash';
import { useEffect, useState } from 'react';
import KEYS from '../../../export/keys';
import URLS from '../../../export/urls';
import useGetAllQuery from '../../../hooks/api/useGetAllQuery';
import usePostQuery from '../../../hooks/api/usePostQuery';

const AddItemContainer = () => {
	const [data, setData] = useState({
		id: 0,
		name: 'Test',
		price: 0,
		canAgree: true,
		description: '',
		categoryId: 0,
		regionId: 0,
		districtId: 0,
		address: '',
		sellTypeId: 0,
		paymentTypeId: 0,
		propertyValues: [],
		files: [], // Updated: files is now an array of IDs
	});

	const [selectCategoryId, setSelectedCategoryId] = useState(null);
	const [saveIds, setSaveIds] = useState([]);
	const [categoriesData, setCategoriesData] = useState({});
	const [fileList, setFileList] = useState([]);
	const [saveData, setSaveData] = useState([]);

	// Kategoriyalarni olish
	const { data: categories } = useGetAllQuery({
		key: `${KEYS.category_list}_${selectCategoryId}`,
		url: `${URLS.category_list}`,
		params: {
			params: {
				page: selectCategoryId ? 0 : 2,
				size: 10,
				parentId: selectCategoryId,
			},
		},
	});

	const categoryItems = isArray(get(categories, 'data.data.content'))
		? get(categories, 'data.data.content')
		: [];

	const onCategoryChange = id => {
		setSelectedCategoryId(id);
		setSaveIds(prev => [...prev, id]);
		setCategoriesData(prev => ({
			...prev,
			[id]: categoryItems,
		}));

		setData(prev => ({
			...prev,
			categoryId: id,
		}));

		// Reset sub-categories when a new main category is selected
		if (saveIds.length === 1) {
			setData(prev => ({
				...prev,
				propertyValues: [],
			}));
		}
	};

	// Regionlarni olish
	const { data: regions } = useGetAllQuery({
		key: `${KEYS.region}`,
		url: `${URLS.region}`,
	});

	const regionItems = isArray(get(regions, 'data.data'))
		? get(regions, 'data.data')
		: [];

	const onRegionChange = id => {
		setData(prev => ({
			...prev,
			regionId: id,
		}));
	};

	const handlePropertyChange = (id, valueTypeId, value) => {
		setData(prev => {
			const updatedProperties = prev.propertyValues.filter(
				p => p.propertyId !== id
			);
			updatedProperties.push({
				id: 0,
				propertyId: id,
				valueTypeId,
				intValue: valueTypeId === 1 ? Number(value) : null,
				stringValue: valueTypeId === 3 ? value : null,
				booleanValue: valueTypeId === 2 ? value : null,
				doubleValue: valueTypeId === 4 ? Number(value) : null,
				dateValue: valueTypeId === 5 ? value : null,
			});
			return { ...prev, propertyValues: updatedProperties };
		});
	};

	// Districtlarni olish
	const { data: district } = useGetAllQuery({
		key: `${KEYS.district_list}/${data.regionId}`,
		url: `${URLS.district_list}/${data.regionId}`,
		params: {
			params: {
				page: 0,
				size: 10,
			},
		},
		enabled: !!data.regionId,
	});

	const districtItems = isArray(get(district, 'data.data.content'))
		? get(district, 'data.data.content')
		: [];

	const onDistrictChange = id => {
		setData(prev => ({
			...prev,
			districtId: id,
		}));
	};

	// Sotuv turini olish
	const { data: sellType } = useGetAllQuery({
		key: `${KEYS.sell_type}`,
		url: `${URLS.sell_type}`,
	});

	const sellTypeItems = isArray(get(sellType, 'data.data'))
		? get(sellType, 'data.data')
		: [];

	const onSellTypeChange = id => {
		setData(prev => ({
			...prev,
			sellTypeId: id,
		}));
	};

	// to'lov turini olish
	const { data: paymentType } = useGetAllQuery({
		key: `${KEYS.payment_type}`, // Updated: key for payment type
		url: `${URLS.payment_type}`, // Updated: URL for payment type
	});

	const paymentTypeItems = isArray(get(paymentType, 'data.data'))
		? get(paymentType, 'data.data')
		: [];

	const onPaymentTypeChange = id => {
		setData(prev => ({
			...prev,
			paymentTypeId: id,
		}));
	};

	// input ma'lumotlarni typelari bilan get qilish
	const { data: getInputWithType } = useGetAllQuery({
		key: `/category/properties/${data.categoryId}`,
		url: `/category/properties/${data.categoryId}`,
		enabled: !!data.categoryId,
	});

	const inputTypeitems = isArray(get(getInputWithType, 'data.data', []))
		? get(getInputWithType, 'data.data')
		: [];

	const { mutate: addProduct } = usePostQuery({});
	const { mutate } = usePostQuery({});

	const onFileChange = event => {
		const files = Array.from(event.target.files);
		console.log(files);

		setFileList(prev => ({
			...prev,
			files: [...(prev.files || []), ...files],
		}));

		handleFileUpload(files);
	};

	const removeFile = index => {
		setData(prev => ({
			...prev,
			files: prev.files.filter((_, i) => i !== index),
		}));
	};

	const handleFileUpload = files => {
		files.forEach(file => {
			const formData = new FormData();
			formData.append('file', file);

			mutate(
				{
					url: URLS.file_upload,
					attributes: formData,
					config: {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					},
				},
				{
					onSuccess: res => {
						const id = res?.data?.data?.id;
						if (id) {
							console.log(`Fayl yuklandi: ${file.name}, ID: ${id}`);

							setData(prev => ({
								files: [
									...prev.files,
									{
										id: 0,
										fileItemId: id,
										mainFile: prev.files.length === 0,
									},
								],
							}));
						}
					},
					onError: err => {
						console.log('Fayl yuklashda xatolik:', err);
					},
				}
			);
		});
	};

	const handleAddProduct = () => {
		addProduct(
			{
				url: URLS.product,
				attributes: {
					...data,
					files: data.files,
				},
			},
			{
				onSuccess: res => {
					if (res) {
						console.log('Mahsulot yuklandi!');
					}
				},
				onError: err => {
					console.log(err);
				},
			}
		);
	};

	useEffect(() => {
		console.log(data);
		setSaveData(data);
	}, [data]);

	const fetchSubCategories = async parentId => {
		try {
			// Replace with your actual API call to fetch subcategories
			const response = await fetch(`/api/categories?parentId=${parentId}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const subCategories = await response.json();
			return subCategories;
		} catch (error) {
			console.error('Error fetching subcategories:', error);
			return []; // Return an empty array on error
		}
	};

	useEffect(() => {
		if (selectCategoryId) {
			fetchSubCategories(selectCategoryId).then(subCategories => {
				setCategoriesData(prev => ({
					...prev,
					[selectCategoryId]: subCategories,
				}));
			});
		}
	}, [selectCategoryId]);

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<header className='bg-white border-b'>
				<div className='container mx-auto px-4 py-2 flex justify-between items-center'>
					<div className='flex items-center space-x-4'>
						<button className='text-gray-600 hover:text-gray-800'>
							<span className='flex items-center'>
								<svg
									className='w-5 h-5 mr-2'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
								Kategoriya
							</span>
						</button>
						<button className='text-gray-600 hover:text-gray-800'>
							<span className='flex items-center'>
								<svg
									className='w-5 h-5 mr-2'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
									/>
								</svg>
								O'zbekiston
							</span>
						</button>
					</div>
					<div className='flex items-center space-x-4'>
						<button className='text-teal-600 border border-teal-600 px-4 py-2 rounded-md hover:bg-teal-50'>
							Qo'shish
						</button>
					</div>
				</div>
			</header>

			{/* Main Form */}
			<main className='container mx-auto px-4 py-8'>
				<div className='max-w-4xl mx-auto bg-white rounded-lg shadow p-6'>
					<h1 className='text-2xl font-semibold mb-6'>Kartira</h1>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Left Column */}
						<div className='space-y-4'>
							{/* Dynamic Categories */}
							<div className='space-y-4'>
								{saveIds?.map((id, index) => (
									<div key={id}>
										<label className='block text-sm font-medium text-gray-700 mb-1'>
											{index === 0 ? 'Kategoriya' : `Sub-kategoriya ${index}`}
										</label>
										<select
											onChange={e => onCategoryChange(e.target.value)}
											className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
										>
											<option value=''>Kategoriyani tanlang</option>
											{categoriesData[id]?.map(item => (
												<option key={item?.id} value={item?.id}>
													{item?.name}
												</option>
											))}
										</select>
									</div>
								))}

								{/* Main category selection */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										{saveIds.length === 0
											? 'Kategoriya'
											: `Sub-kategoriya ${saveIds.length + 1}`}
									</label>
									<select
										onChange={e => onCategoryChange(e.target.value)}
										className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
									>
										<option value=''>Kategoriyani tanlang</option>
										{categoryItems?.map(item => (
											<option key={item?.id} value={item?.id}>
												{item?.name}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Hudud
								</label>
								<select
									onChange={e => onRegionChange(e.target.value)}
									className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
								>
									<option value=''>Hududni tanlang</option>
									{regionItems?.map(item => (
										<option key={item?.id} value={item?.id}>
											{item?.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									E'lon nomi
								</label>
								<input
									type='text'
									className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
									placeholder="E'lon nomini kiriting"
									value={data.name}
									onChange={e =>
										setData(prev => ({ ...prev, name: e.target.value }))
									}
								/>
							</div>
						</div>

						{/* Right Column */}
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Telefon nomer
								</label>
								<input
									type='tel'
									className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
									placeholder='+998'
								/>
							</div>

							{data.regionId && (
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Tuman
									</label>
									<select
										onChange={e => onDistrictChange(e.target.value)}
										className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
									>
										<option value=''>Tumanni tanlang</option>
										{districtItems?.map(item => (
											<option key={item?.id} value={item?.id}>
												{item?.name}
											</option>
										))}
									</select>
								</div>
							)}
						</div>
					</div>

					{/* Dynamic Property Inputs based on Category */}
					{data.categoryId && (
						<div className='col-span-1 md:col-span-2 space-y-4 mt-6 p-4 bg-gray-50 rounded-lg'>
							<h3 className='font-medium text-gray-900'>
								Qo'shimcha ma'lumotlar
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{inputTypeitems?.map(item => (
									<div key={item.id} className='space-y-1'>
										<label className='block text-sm font-medium text-gray-700'>
											{item.name}
										</label>
										{item.valueTypeDto.typeName === 'STRING' && (
											<input
												type='text'
												onChange={e =>
													handlePropertyChange(
														item.id,
														item.valueTypeDto.id,
														e.target.value
													)
												}
												className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
												placeholder={`${item.name}ni kiriting`}
											/>
										)}
										{item.valueTypeDto.typeName === 'INTEGER' && (
											<input
												type='number'
												onChange={e =>
													handlePropertyChange(
														item.id,
														item.valueTypeDto.id,
														e.target.value
													)
												}
												className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
												placeholder='0'
											/>
										)}
										{item.valueTypeDto.typeName === 'BOOLEAN' && (
											<label className='relative inline-flex items-center cursor-pointer'>
												<input
													type='checkbox'
													onChange={e =>
														handlePropertyChange(
															item.id,
															item.valueTypeDto.id,
															e.target.checked
														)
													}
													className='sr-only peer'
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
												<span className='ml-3 text-sm font-medium text-gray-700'>
													{item.name}
												</span>
											</label>
										)}
										{item.valueTypeDto.typeName === 'DOUBLE' && (
											<input
												type='number'
												step='0.01'
												onChange={e =>
													handlePropertyChange(
														item.id,
														item.valueTypeDto.id,
														e.target.value
													)
												}
												className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
												placeholder='0.00'
											/>
										)}
										{item.valueTypeDto.typeName === 'DATE' && (
											<input
												type='date'
												onChange={e =>
													handlePropertyChange(
														item.id,
														item.valueTypeDto.id,
														e.target.value
													)
												}
												className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
											/>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Description */}
					<div className='mt-6'>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Tavsif
						</label>
						<textarea
							rows={4}
							className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
							placeholder="Batafsil ma'lumot kiriting"
							value={data.description}
							onChange={e =>
								setData(prev => ({ ...prev, description: e.target.value }))
							}
						/>
						<div className='text-right text-sm text-gray-500'>0/1000</div>
					</div>

					{/* Price Section */}
					<div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Narx turi
							</label>
							<select
								onChange={e => onSellTypeChange(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
							>
								<option value=''>Narx turini tanlang</option>
								{sellTypeItems?.map(item => (
									<option key={item?.id} value={item?.id}>
										{item?.name}
									</option>
								))}
							</select>
						</div>
						<div>
							{' '}
							{/* Added Payment Type Selection */}
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								To'lov turi
							</label>
							<select
								onChange={e => onPaymentTypeChange(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
							>
								<option value=''>To'lov turini tanlang</option>
								{paymentTypeItems?.map(item => (
									<option key={item?.id} value={item?.id}>
										{item?.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Valyuta turi
							</label>
							<div className='grid grid-cols-2 gap-2'>
								<button className='p-2 bg-teal-600 text-white rounded-md'>
									UZS
								</button>
								<button className='p-2 border border-gray-300 rounded-md'>
									USD
								</button>
							</div>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Narxi
							</label>
							<input
								type='text'
								className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
								placeholder='Narxni kiriting'
								value={data.price}
								onChange={e =>
									setData(prev => ({ ...prev, price: Number(e.target.value) }))
								}
							/>
						</div>
					</div>

					{/* Toggle */}
					<div className='mt-6 flex items-center'>
						<label className='relative inline-flex items-center cursor-pointer'>
							<input
								type='checkbox'
								className='sr-only peer'
								checked={data.canAgree}
								onChange={e =>
									setData(prev => ({ ...prev, canAgree: e.target.checked }))
								}
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
							<span className='ml-3 text-sm font-medium text-gray-700'>
								Kelishish mumkin
							</span>
						</label>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Manzil
						</label>
						<input
							type='text'
							className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
							placeholder='Manzilni kiriting'
							value={data.address}
							onChange={e =>
								setData(prev => ({ ...prev, address: e.target.value }))
							}
						/>
					</div>

					{/* Image Upload */}
					<div className='mt-6'>
						<div className='flex items-center justify-center w-full'>
							<label className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
								<div className='flex flex-col items-center justify-center pt-5 pb-6'>
									<svg
										className='w-8 h-8 mb-4 text-gray-500'
										aria-hidden='true'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 20 16'
									>
										<path
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
										/>
									</svg>
									<p className='mb-2 text-sm text-gray-500'>
										<span className='font-semibold'>Rasmlarni yuklash</span>
									</p>
									<p className='text-xs text-gray-500'>
										PNG, JPG (MAX. 800x400px)
									</p>
								</div>
								<input
									type='file'
									className='hidden'
									multiple
									onChange={onFileChange}
								/>
							</label>
						</div>
						<div className='mt-4 grid grid-cols-5 gap-4'>
							{fileList?.files?.map((file, index) => (
								<div key={index} className='relative group'>
									<img
										src={URL.createObjectURL(file) || '/placeholder.svg'}
										alt='uploaded'
										className='w-full h-24 object-cover rounded-lg'
									/>
									<button
										onClick={() => removeFile(index)}
										className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
									>
										<svg
											className='w-4 h-4'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth='2'
												d='M6 18L18 6M6 6l12 12'
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Buttons */}
					<div className='mt-8 flex space-x-4'>
						<button
							onClick={handleAddProduct}
							className='flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200'
						>
							E'lonni yuklash
						</button>
						<button className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200'>
							Bekor qilish
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AddItemContainer;
