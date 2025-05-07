'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import api from '../../../config/auth/api';

const AddItemContainer = () => {
	// Form state
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		price: '',
		categoryId: '',
		location: '',
		mainImage: '',
		images: [],
		properties: [],
		paymentType: 'Pullik',
		currencyType: 'UZS',
		negotiable: false,
		regionId: '',
		districtId: '',
	});

	// Loading states
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);
	const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
	const [isLoadingRegions, setIsLoadingRegions] = useState(false);
	const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
	const [isLoadingProperties, setIsLoadingProperties] = useState(false);
	const [uploadingImages, setUploadingImages] = useState([]);

	// Data states
	const [categories, setCategories] = useState([]);
	const [subcategories, setSubcategories] = useState([]);
	const [regions, setRegions] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [categoryProperties, setCategoryProperties] = useState([]);

	// Fetch initial data
	useEffect(() => {
		fetchCategories();
		fetchRegions();
	}, []);

	// Fetch categories
	const fetchCategories = async () => {
		setIsLoadingCategories(true);
		try {
			const response = await api.get('/category?parentId=null');
			if (response.data.success) {
				setCategories(response.data.content);
				console.log(response.data.content);
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
			toast.error('Kategoriyalarni yuklashda xatolik yuz berdi');
		} finally {
			setIsLoadingCategories(false);
		}
	};

	// Fetch subcategories when category changes
	useEffect(() => {
		if (formData.categoryId) {
			fetchSubcategories(formData.categoryId);
			fetchCategoryProperties(formData.categoryId);
		}
	}, [formData.categoryId]);

	// Fetch subcategories
	const fetchSubcategories = async categoryId => {
		setIsLoadingSubcategories(true);
		try {
			const response = await api.get(`/category/${categoryId}/children`);
			if (response.data.success) {
				setSubcategories(response.data.content);
			}
		} catch (error) {
			console.error('Error fetching subcategories:', error);
			toast.error('Subkategoriyalarni yuklashda xatolik yuz berdi');
		} finally {
			setIsLoadingSubcategories(false);
		}
	};

	// Fetch category properties
	const fetchCategoryProperties = async categoryId => {
		setIsLoadingProperties(true);
		try {
			const response = await api.get(`/category/${categoryId}`);
			if (response.data.success) {
				setCategoryProperties(response.data.content.properties || []);

				// Initialize properties array with empty values
				const initialProperties = (response.data.content.properties || []).map(
					prop => ({
						propertyId: prop.id,
						type: prop.type,
						value: {
							key: prop.name,
							value: '',
						},
					})
				);

				setFormData(prev => ({
					...prev,
					properties: initialProperties,
				}));
			}
		} catch (error) {
			console.error('Error fetching category properties:', error);
			toast.error('Kategoriya xususiyatlarini yuklashda xatolik yuz berdi');
		} finally {
			setIsLoadingProperties(false);
		}
	};

	// Fetch regions
	const fetchRegions = async () => {
		setIsLoadingRegions(true);
		try {
			const response = await api.get('/location/regions');
			if (response.data.success) {
				setRegions(response.data.content);
			}
		} catch (error) {
			console.error('Error fetching regions:', error);
			toast.error('Viloyatlarni yuklashda xatolik yuz berdi');
		} finally {
			setIsLoadingRegions(false);
		}
	};

	// Fetch districts when region changes
	useEffect(() => {
		if (formData.regionId) {
			fetchDistricts(formData.regionId);
		} else {
			setDistricts([]);
			setFormData(prev => ({ ...prev, districtId: '' }));
		}
	}, [formData.regionId]);

	// Fetch districts
	const fetchDistricts = async regionId => {
		setIsLoadingDistricts(true);
		try {
			const response = await api.get(`/location/districts/${regionId}`);
			if (response.data.success) {
				setDistricts(response.data.content);
			}
		} catch (error) {
			console.error('Error fetching districts:', error);
			toast.error('Tumanlarni yuklashda xatolik yuz berdi');
		} finally {
			setIsLoadingDistricts(false);
		}
	};

	// Handle form input changes
	const handleChange = e => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	// Handle property value changes
	const handlePropertyChange = (propertyId, value) => {
		setFormData(prev => ({
			...prev,
			properties: prev.properties.map(prop =>
				prop.propertyId === propertyId
					? { ...prop, value: { ...prop.value, value } }
					: prop
			),
		}));
	};

	// Handle image upload
	const uploadImage = async file => {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await api.post('/file/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response?.data?.success) {
				return response?.data?.content?.url;
			}
			throw new Error('Upload failed');
		} catch (error) {
			console.error('Error uploading image:', error);
			toast.error('Rasmni yuklashda xatolik yuz berdi');
			throw error;
		}
	};

	// Handle main image drop
	const onMainImageDrop = useCallback(async acceptedFiles => {
		if (acceptedFiles.length === 0) return;

		const file = acceptedFiles[0];

		// Add to uploading state
		const uploadId = Date.now().toString();
		setUploadingImages(prev => [
			...prev,
			{ id: uploadId, name: file.name, progress: 0 },
		]);

		try {
			// Upload the image
			const imageUrl = await uploadImage(file);

			// Update progress
			setUploadingImages(prev =>
				prev.map(img => (img.id === uploadId ? { ...img, progress: 100 } : img))
			);

			// Set as main image
			setFormData(prev => ({ ...prev, mainImage: imageUrl }));

			// Remove from uploading state after a delay
			setTimeout(() => {
				setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
			}, 1000);
		} catch (error) {
			// Update uploading state to show error
			setUploadingImages(prev =>
				prev.map(img => (img.id === uploadId ? { ...img, error: true } : img))
			);

			// Remove from uploading state after a delay
			setTimeout(() => {
				setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
			}, 3000);
		}
	}, []);

	// Handle additional images drop
	const onAdditionalImagesDrop = useCallback(async acceptedFiles => {
		if (acceptedFiles.length === 0) return;

		// Process each file sequentially
		for (const file of acceptedFiles) {
			// Add to uploading state
			const uploadId =
				Date.now().toString() + Math.random().toString(36).substring(2, 9);
			setUploadingImages(prev => [
				...prev,
				{ id: uploadId, name: file.name, progress: 0 },
			]);

			try {
				// Upload the image
				const imageUrl = await uploadImage(file);

				// Update progress
				setUploadingImages(prev =>
					prev.map(img =>
						img.id === uploadId ? { ...img, progress: 100 } : img
					)
				);

				// Add to images array
				setFormData(prev => ({
					...prev,
					images: [...prev.images, imageUrl],
				}));

				// Remove from uploading state after a delay
				setTimeout(() => {
					setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
				}, 1000);
			} catch (error) {
				// Update uploading state to show error
				setUploadingImages(prev =>
					prev.map(img => (img.id === uploadId ? { ...img, error: true } : img))
				);

				// Remove from uploading state after a delay
				setTimeout(() => {
					setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
				}, 3000);
			}

			// Add a small delay between uploads
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}, []);

	// Dropzone hooks
	const mainImageDropzone = useDropzone({
		onDrop: onMainImageDrop,
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
		},
		maxFiles: 1,
	});

	const additionalImagesDropzone = useDropzone({
		onDrop: onAdditionalImagesDrop,
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
		},
		maxFiles: 10,
	});

	// Remove an additional image
	const removeAdditionalImage = index => {
		setFormData(prev => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	// Handle form submission
	const handleSubmit = async e => {
		e.preventDefault();

		// Validate form
		if (!formData.title.trim()) {
			toast.error('Iltimos, sarlavhani kiriting');
			return;
		}

		if (!formData.description.trim()) {
			toast.error('Iltimos, tavsifni kiriting');
			return;
		}

		if (
			!formData.price ||
			isNaN(Number(formData.price)) ||
			Number(formData.price) <= 0
		) {
			toast.error("Iltimos, to'g'ri narxni kiriting");
			return;
		}

		if (!formData.categoryId) {
			toast.error('Iltimos, kategoriyani tanlang');
			return;
		}

		if (!formData.regionId) {
			toast.error('Iltimos, viloyatni tanlang');
			return;
		}

		if (!formData.districtId) {
			toast.error('Iltimos, tumanni tanlang');
			return;
		}

		if (!formData.mainImage) {
			toast.error('Iltimos, asosiy rasmni yuklang');
			return;
		}

		// Prepare data for submission
		const submitData = {
			...formData,
			price: Number(formData.price),
		};

		setIsSubmitting(true);

		try {
			const response = await api.post('/products', submitData);

			if (response.data.success) {
				toast.success("E'lon muvaffaqiyatli qo'shildi");
				// Reset form or redirect
				setFormData({
					title: '',
					description: '',
					price: '',
					categoryId: '',
					location: '',
					mainImage: '',
					images: [],
					properties: [],
					paymentType: 'Pullik',
					currencyType: 'UZS',
					negotiable: false,
					regionId: '',
					districtId: '',
				});
			} else {
				toast.error(
					response.data.message || "E'lonni qo'shishda xatolik yuz berdi"
				);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error("E'lonni qo'shishda xatolik yuz berdi");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='bg-gray-50 min-h-screen py-8'>
			<div className='container mx-auto px-4'>
				<div className='max-w-full mx-auto'>
					<h1 className='text-2xl font-bold text-gray-800 mb-6'>
						Yangi e'lon qo'shish
					</h1>

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Basic Information */}
						<div className='bg-white rounded-lg shadow-sm p-6'>
							<h2 className='text-lg font-semibold mb-4'>Asosiy ma'lumotlar</h2>

							<div className='space-y-4'>
								{/* Title */}
								<div>
									<label
										htmlFor='title'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										Sarlavha <span className='text-red-500'>*</span>
									</label>
									<input
										type='text'
										id='title'
										name='title'
										value={formData.title}
										onChange={handleChange}
										className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
										placeholder='Mahsulot nomini kiriting'
										required
									/>
								</div>

								{/* Description */}
								<div>
									<label
										htmlFor='description'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										Tavsif <span className='text-red-500'>*</span>
									</label>
									<textarea
										id='description'
										name='description'
										value={formData.description}
										onChange={handleChange}
										rows={4}
										className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
										placeholder="Mahsulot haqida batafsil ma'lumot"
										required
									/>
								</div>

								{/* Price */}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div>
										<label
											htmlFor='price'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Narx <span className='text-red-500'>*</span>
										</label>
										<div className='flex'>
											<input
												type='number'
												id='price'
												name='price'
												value={formData.price}
												onChange={handleChange}
												className='w-full px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500'
												placeholder='0'
												min='0'
												required
											/>
											<select
												name='currencyType'
												value={formData.currencyType}
												onChange={handleChange}
												className='px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50'
											>
												<option value='UZS'>UZS</option>
												<option value='USD'>USD</option>
											</select>
										</div>
									</div>

									<div>
										<label
											htmlFor='paymentType'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											To'lov turi
										</label>
										<select
											id='paymentType'
											name='paymentType'
											value={formData.paymentType}
											onChange={handleChange}
											className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
										>
											<option value='Pullik'>Pullik</option>
											<option value='Bepul'>Bepul</option>
										</select>
									</div>
								</div>

								{/* Negotiable */}
								<div className='flex items-center'>
									<input
										type='checkbox'
										id='negotiable'
										name='negotiable'
										checked={formData.negotiable}
										onChange={handleChange}
										className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
									/>
									<label
										htmlFor='negotiable'
										className='ml-2 block text-sm text-gray-700'
									>
										Narx kelishiladi
									</label>
								</div>
							</div>
						</div>

						{/* Category Selection */}
						<div className='bg-white rounded-lg shadow-sm p-6'>
							<h2 className='text-lg font-semibold mb-4'>Kategoriya</h2>

							<div className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									{/* Main Category */}
									<div>
										<label
											htmlFor='categoryId'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Asosiy kategoriya <span className='text-red-500'>*</span>
										</label>
										<select
											id='categoryId'
											name='categoryId'
											value={formData.categoryId}
											onChange={handleChange}
											className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
											required
										>
											<option value=''>Kategoriyani tanlang</option>
											{categories.map(category => (
												<option key={category.id} value={category.id}>
													{category.name}
												</option>
											))}
										</select>
										{isLoadingCategories && (
											<p className='mt-1 text-sm text-gray-500'>
												Kategoriyalar yuklanmoqda...
											</p>
										)}
									</div>

									{/* Subcategory - Show only if subcategories exist */}
									{subcategories.length > 0 && (
										<div>
											<label
												htmlFor='subcategoryId'
												className='block text-sm font-medium text-gray-700 mb-1'
											>
												Subkategoriya
											</label>
											<select
												id='subcategoryId'
												name='subcategoryId'
												value={formData.subcategoryId || ''}
												onChange={handleChange}
												className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
											>
												<option value=''>Subkategoriyani tanlang</option>
												{subcategories.map(subcategory => (
													<option key={subcategory.id} value={subcategory.id}>
														{subcategory.name}
													</option>
												))}
											</select>
											{isLoadingSubcategories && (
												<p className='mt-1 text-sm text-gray-500'>
													Subkategoriyalar yuklanmoqda...
												</p>
											)}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Properties - Show only if properties exist */}
						{categoryProperties.length > 0 && (
							<div className='bg-white rounded-lg shadow-sm p-6'>
								<h2 className='text-lg font-semibold mb-4'>Xususiyatlar</h2>

								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										{categoryProperties.map(property => (
											<div key={property.id}>
												<label
													htmlFor={`property-${property.id}`}
													className='block text-sm font-medium text-gray-700 mb-1'
												>
													{property.name}
												</label>

												{property.type === 'STRING' && !property.options && (
													<input
														type='text'
														id={`property-${property.id}`}
														value={
															formData.properties.find(
																p => p.propertyId === property.id
															)?.value.value || ''
														}
														onChange={e =>
															handlePropertyChange(property.id, e.target.value)
														}
														className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
														placeholder={`${property.name} kiriting`}
													/>
												)}

												{property.type === 'SELECT' ||
													(property.type === 'STRING' && property.options && (
														<select
															id={`property-${property.id}`}
															value={
																formData.properties.find(
																	p => p.propertyId === property.id
																)?.value.value || ''
															}
															onChange={e =>
																handlePropertyChange(
																	property.id,
																	e.target.value
																)
															}
															className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
														>
															<option value=''>Tanlang</option>
															{property.options &&
																property.options.map((option, index) => (
																	<option key={index} value={option}>
																		{option}
																	</option>
																))}
														</select>
													))}

												{property.type === 'DATE' && (
													<input
														type='date'
														id={`property-${property.id}`}
														value={
															formData.properties.find(
																p => p.propertyId === property.id
															)?.value.value || ''
														}
														onChange={e =>
															handlePropertyChange(property.id, e.target.value)
														}
														className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
													/>
												)}

												{property.type === 'BOOLEAN' && (
													<div className='flex items-center'>
														<input
															type='checkbox'
															id={`property-${property.id}`}
															checked={
																formData.properties.find(
																	p => p.propertyId === property.id
																)?.value.value === 'true'
															}
															onChange={e =>
																handlePropertyChange(
																	property.id,
																	e.target.checked ? 'true' : 'false'
																)
															}
															className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
														/>
														<label
															htmlFor={`property-${property.id}`}
															className='ml-2 block text-sm text-gray-700'
														>
															{property.name}
														</label>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Location */}
						<div className='bg-white rounded-lg shadow-sm p-6'>
							<h2 className='text-lg font-semibold mb-4'>Joylashuv</h2>

							<div className='space-y-4'>
								{/* Region and District */}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div>
										<label
											htmlFor='regionId'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Viloyat <span className='text-red-500'>*</span>
										</label>
										<select
											id='regionId'
											name='regionId'
											value={formData.regionId}
											onChange={handleChange}
											className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
											required
										>
											<option value=''>Viloyatni tanlang</option>
											{regions.map(region => (
												<option key={region.id} value={region.id}>
													{region.name}
												</option>
											))}
										</select>
										{isLoadingRegions && (
											<p className='mt-1 text-sm text-gray-500'>
												Viloyatlar yuklanmoqda...
											</p>
										)}
									</div>

									<div>
										<label
											htmlFor='districtId'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Tuman <span className='text-red-500'>*</span>
										</label>
										<select
											id='districtId'
											name='districtId'
											value={formData.districtId}
											onChange={handleChange}
											className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
											required
											disabled={!formData.regionId || districts.length === 0}
										>
											<option value=''>Tumanni tanlang</option>
											{districts.map(district => (
												<option key={district.id} value={district.id}>
													{district.name}
												</option>
											))}
										</select>
										{isLoadingDistricts && (
											<p className='mt-1 text-sm text-gray-500'>
												Tumanlar yuklanmoqda...
											</p>
										)}
									</div>
								</div>

								{/* Detailed Location */}
								<div>
									<label
										htmlFor='location'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										Manzil
									</label>
									<input
										type='text'
										id='location'
										name='location'
										value={formData.location}
										onChange={handleChange}
										className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
										placeholder='Batafsil manzil'
									/>
								</div>
							</div>
						</div>

						{/* Images */}
						<div className='bg-white rounded-lg shadow-sm p-6'>
							<h2 className='text-lg font-semibold mb-4'>Rasmlar</h2>

							<div className='space-y-6'>
								{/* Main Image */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Asosiy rasm <span className='text-red-500'>*</span>
									</label>

									<div
										{...mainImageDropzone.getRootProps()}
										className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
											mainImageDropzone.isDragActive
												? 'border-blue-400 bg-blue-50'
												: 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
										}`}
									>
										<input {...mainImageDropzone.getInputProps()} />

										{formData.mainImage ? (
											<div className='relative'>
												<img
													src={formData.mainImage || '/placeholder.svg'}
													alt='Main product'
													className='h-48 mx-auto object-contain'
												/>
												<button
													type='button'
													onClick={e => {
														e.stopPropagation();
														setFormData(prev => ({ ...prev, mainImage: '' }));
													}}
													className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600'
												>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														className='h-5 w-5'
														viewBox='0 0 20 20'
														fill='currentColor'
													>
														<path
															fillRule='evenodd'
															d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
															clipRule='evenodd'
														/>
													</svg>
												</button>
											</div>
										) : (
											<div>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='mx-auto h-12 w-12 text-gray-400'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
													/>
												</svg>
												<p className='mt-2 text-sm text-gray-500'>
													Rasmni yuklash uchun bosing yoki shu yerga tashlang
												</p>
												<p className='text-xs text-gray-400 mt-1'>
													PNG, JPG, WEBP (max: 5MB)
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Additional Images */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Qo'shimcha rasmlar
									</label>

									<div
										{...additionalImagesDropzone.getRootProps()}
										className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
											additionalImagesDropzone.isDragActive
												? 'border-blue-400 bg-blue-50'
												: 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
										}`}
									>
										<input {...additionalImagesDropzone.getInputProps()} />

										<div>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='mx-auto h-12 w-12 text-gray-400'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
												/>
											</svg>
											<p className='mt-2 text-sm text-gray-500'>
												Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
											</p>
											<p className='text-xs text-gray-400 mt-1'>
												PNG, JPG, WEBP (max: 5MB)
											</p>
										</div>
									</div>

									{/* Display additional images */}
									{formData.images.length > 0 && (
										<div className='mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4'>
											{formData.images.map((image, index) => (
												<div key={index} className='relative'>
													<img
														src={image || '/placeholder.svg'}
														alt={`Product ${index + 1}`}
														className='h-24 w-full object-cover rounded-md'
													/>
													<button
														type='button'
														onClick={() => removeAdditionalImage(index)}
														className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600'
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-4 w-4'
															viewBox='0 0 20 20'
															fill='currentColor'
														>
															<path
																fillRule='evenodd'
																d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
																clipRule='evenodd'
															/>
														</svg>
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Uploading Progress */}
								{uploadingImages.length > 0 && (
									<div className='mt-4 space-y-2'>
										{uploadingImages.map(img => (
											<div key={img.id} className='bg-gray-50 rounded-md p-3'>
												<div className='flex justify-between items-center mb-1'>
													<span className='text-sm font-medium truncate'>
														{img.name}
													</span>
													<span className='text-xs text-gray-500'>
														{img.progress}%
													</span>
												</div>
												<div className='w-full bg-gray-200 rounded-full h-2'>
													<div
														className={`h-2 rounded-full ${
															img.error ? 'bg-red-500' : 'bg-blue-500'
														}`}
														style={{ width: `${img.progress}%` }}
													></div>
												</div>
												{img.error && (
													<p className='text-xs text-red-500 mt-1'>
														Yuklashda xatolik yuz berdi
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Submit Button */}
						<div className='flex justify-end'>
							<button
								type='submit'
								disabled={isSubmitting}
								className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
									isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
								}`}
							>
								{isSubmitting ? 'Yuklanmoqda...' : "E'lonni qo'shish"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AddItemContainer;
