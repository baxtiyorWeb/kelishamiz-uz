'use client';

import { get, isArray, isNull } from 'lodash';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGetOneQuery from '../../../hooks/api/useGetOneQuery';
import KEYS from './../../../export/keys';
import URLS from './../../../export/urls';

const ProductDetail = () => {
	const { id } = useParams();
	const [selectedImage, setSelectedImage] = useState(null);
	const [activeTab, setActiveTab] = useState('description');
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const { data } = useGetOneQuery({
		key: `${KEYS.product_detail}/${id}`,
		url: `${URLS.product_detail}/${id}`,
		enabled: !!id,
	});

	const item = !isNull(get(data, 'data.content'))
		? get(data, 'data.content', {})
		: {};

	// Set main image as selected image when data loads
	useEffect(() => {
		if (item?.mainImage) {
			setSelectedImage(item.mainImage);
		}
	}, [item?.mainImage]);

	const mainImage = selectedImage || item?.mainImage;

	// Default image if no images are available
	const defaultImage =
		'https://via.placeholder.com/600x400?text=No+Image+Available';

	// Format date
	const formatDate = dateString => {
		if (!dateString) return '';
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleString('default', { month: 'long' });
		const year = date.getFullYear();
		const hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');

		return `${day} ${month}, ${year}. ${hours}:${minutes}`;
	};

	// Format price with currency
	const formatPrice = price => {
		if (!price) return '';
		const numPrice = Number.parseFloat(price);
		return new Intl.NumberFormat('uz-UZ').format(numPrice);
	};

	// Get all images including main image
	const allImages = [
		item?.mainImage,
		...(isArray(item?.images)
			? item?.images.filter(img => img !== 'string')
			: []),
	].filter(Boolean);

	// Handle like button click
	const handleLikeClick = () => {
		setIsLiked(!isLiked);
		// Here you would typically call an API to update the like status
	};

	return (
		<div className='bg-gray-50 min-h-screen pb-20 md:pb-16'>
			{/* Mobile Header */}
			{isMobile && (
				<div className='sticky top-0 z-10 bg-white shadow-sm'>
					<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
						<button className='p-2 -ml-2' onClick={() => window.history.back()}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
						</button>
						<h1 className='text-lg font-medium truncate max-w-[200px]'>
							{item?.title}
						</h1>
						<div className='flex items-center'>
							<button className='p-2 relative' onClick={handleLikeClick}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill={isLiked ? 'currentColor' : 'none'}
									viewBox='0 0 24 24'
									stroke='currentColor'
									style={{ color: isLiked ? '#ef4444' : 'currentColor' }}
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
									/>
								</svg>
								{item?.likesCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center'>
										{item.likesCount}
									</span>
								)}
							</button>
							<button className='p-2 relative ml-1'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
									/>
								</svg>
								{item?.commentsCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center'>
										{item.commentsCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='container mx-auto px-4 py-4 md:py-8'>
				{/* Breadcrumbs - Desktop only */}
				<div className='hidden md:flex items-center text-sm text-gray-500 mb-6'>
					<a href='/' className='hover:text-blue-600'>
						Bosh sahifa
					</a>
					<span className='mx-2'>/</span>
					<a href='/products' className='hover:text-blue-600'>
						Mahsulotlar
					</a>
					<span className='mx-2'>/</span>
					<span className='text-gray-700 truncate max-w-[200px]'>
						{item?.title}
					</span>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8'>
					{/* Left Column - Images and Properties */}
					<div className='md:col-span-1 lg:col-span-3'>
						{/* Main Image */}
						<div className='bg-white rounded-lg shadow-sm overflow-hidden'>
							<div
								className='h-[300px] md:h-[400px] w-full bg-gray-100 flex items-center justify-center relative'
								style={{
									backgroundImage: `url(${mainImage || defaultImage})`,
									backgroundSize: 'contain',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
								}}
							>
								{/* Like Button - Overlay */}
								<button
									onClick={handleLikeClick}
									className='absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill={isLiked ? 'currentColor' : 'none'}
										viewBox='0 0 24 24'
										stroke='currentColor'
										style={{ color: isLiked ? '#ef4444' : 'currentColor' }}
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
										/>
									</svg>
								</button>

								{/* Image Counter - Mobile only */}
								{isMobile && allImages.length > 1 && (
									<div className='absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full'>
										{allImages.indexOf(selectedImage) + 1} / {allImages.length}
									</div>
								)}
							</div>

							{/* Thumbnails */}
							{allImages.length > 1 && (
								<div className='p-4 overflow-x-auto'>
									<div className='flex space-x-3'>
										{allImages.map((image, index) => {
											if (image === 'string' || !image) return null;
											return (
												<div
													key={index}
													className={`border rounded-lg w-16 h-16 md:w-20 md:h-20 min-w-[4rem] md:min-w-[5rem] bg-gray-100 cursor-pointer transition-all duration-200 ${
														selectedImage === image
															? 'ring-2 ring-blue-500 scale-105'
															: 'hover:ring-1 hover:ring-gray-300'
													}`}
													style={{
														backgroundImage: `url(${image})`,
														backgroundSize: 'cover',
														backgroundPosition: 'center',
													}}
													onClick={() => setSelectedImage(image)}
												></div>
											);
										})}
									</div>
								</div>
							)}
						</div>

						{/* Product Properties - Moved below image */}
						<div className='mt-6 space-y-4 bg-white rounded-lg shadow-sm p-4 md:p-6'>
							<div className='space-y-1'>
								<h2 className='text-lg font-semibold mb-4'>
									Qisqacha ma&apos;lumot
								</h2>
								<p className='text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line'>
									{item?.description || "Mahsulot haqida ma'lumot mavjud emas."}
								</p>
							</div>
							<div>
								<h2 className='text-lg font-semibold mb-4'>Xususiyatlar</h2>
								<div className='space-y-1'>
									{isArray(item?.productProperties) &&
									item?.productProperties.length > 0 ? (
										item.productProperties.map((property, index) => (
											<div
												key={index}
												className='flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
											>
												<p className='text-gray-600 font-medium'>
													{property?.property?.name || property?.value?.key}
												</p>
												<div className='flex-1 mx-4 border-t border-dashed border-gray-200 hidden md:block'></div>
												<p className='text-gray-900 font-medium'>
													{property?.value?.value}
												</p>
											</div>
										))
									) : (
										<p className='text-gray-500 italic'>
											Xususiyatlar haqida ma&apos;lumot mavjud emas.
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Product Info */}
					<div className='md:col-span-1 lg:col-span-2'>
						<div className='bg-white rounded-lg shadow-sm p-4 md:p-6 md:sticky md:top-4'>
							{/* Location and Date */}
							<div className='flex items-center text-xs md:text-sm text-gray-500 mb-3 md:mb-4 flex-wrap'>
								<span>
									{item?.region?.name}{' '}
									{item?.district?.name && `, ${item?.district?.name}`}
								</span>
								<div className='w-1 h-1 bg-gray-400 rounded-full mx-2'></div>
								<span>Qo'shilgan: {formatDate(item?.createdAt)}</span>
							</div>

							{/* Title - Desktop only */}
							<h1 className='hidden md:block text-xl lg:text-2xl font-bold text-gray-900 mb-4'>
								{item?.title}
							</h1>

							{/* Price */}
							<div className='mb-4 md:mb-6'>
								<div className='flex items-baseline flex-wrap'>
									<span className='text-2xl md:text-3xl font-bold text-gray-900'>
										{formatPrice(item?.price)} {item?.currencyType}
									</span>
									{item?.negotiable && (
										<span className='ml-2 text-sm text-green-600 font-medium'>
											Narxi kelishiladi
										</span>
									)}
								</div>
								<div className='mt-1 text-sm text-gray-600'>
									<span className='font-medium'>{item?.paymentType}</span>
								</div>
							</div>

							{/* Contact Information - Always visible */}
							<div className='mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100'>
								<h3 className='text-lg font-semibold mb-3'>
									Sotuvchi bilan bog'lanish
								</h3>
								<div className='flex items-center'>
									<div className='w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl'>
										{item?.profile?.fullName?.charAt(0) || 'S'}
									</div>
									<div className='ml-3'>
										<p className='font-medium'>
											{item?.profile?.fullName || 'Sotuvchi'}
										</p>
										<p className='text-sm font-medium text-blue-600'>
											{item?.profile?.phoneNumber ||
												"Telefon raqam ko'rsatilmagan"}
										</p>
										{item?.profile?.location && (
											<p className='text-xs text-gray-500 mt-1'>
												{item.profile.location}
											</p>
										)}
									</div>
								</div>
								<div className='mt-4 flex space-x-3'>
									<button className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors'>
										Qo'ng'iroq qilish
									</button>
									<button className='flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors'>
										Xabar yozish
									</button>
								</div>
							</div>

							{/* Social Stats with Like Button */}
							<div className='flex items-center space-x-4 mb-6'>
								<button
									onClick={handleLikeClick}
									className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
										isLiked
											? 'bg-red-50 text-red-500 border border-red-200'
											: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
									}`}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill={isLiked ? 'currentColor' : 'none'}
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
										/>
									</svg>
									<span>{item?.likesCount || 0}</span>
								</button>
								<div className='flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5 mr-2'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
										/>
									</svg>
									<span>{item?.commentsCount || 0}</span>
								</div>
							</div>

							{/* Location Info */}
							{(item?.region?.name || item?.district?.name) && (
								<div className='mt-4 pt-4 border-t border-gray-100'>
									<div className='flex justify-between items-center'>
										<span className='text-gray-500'>Joylashuv:</span>
										<span className='font-medium'>
											{item?.region?.name}{' '}
											{item?.district?.name && `, ${item?.district?.name}`}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Sticky Footer - Mobile only */}
			{isMobile && (
				<div className='fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 flex space-x-3'>
					<button className='flex-1 bg-white border border-blue-600 text-blue-600 font-medium py-2.5 px-4 rounded-lg'>
						Qo'ng'iroq qilish
					</button>
					<button className='flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg'>
						Xabar yozish
					</button>
				</div>
			)}
		</div>
	);
};

export default ProductDetail;
