'use client';

import { format } from 'date-fns';
import { Calendar, Eye, Heart } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const ItemCard = React.memo(({ item, index }) => {
	const formattedDate = useMemo(() => {
		if (item?.createdAt) {
			return format(new Date(item.createdAt), 'dd MMM');
		}
		return '';
	}, [item?.createdAt]);

	const detailLink = useMemo(() => `/detail/${item?.id}?infoTab=1`, [item?.id]);

	return (
		<div
			className={`group relative flex-shrink-0 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
				index ? 'animate-fade-in' : ''
			}`}
		>
			{/* TOP badge */}
			{item?.isTop && (
				<span className='absolute left-3 top-3 z-10 bg-red-500 px-2 py-0.5 text-xs font-medium text-white rounded'>
					TOP
				</span>
			)}

			{/* Image container */}
			<div className='relative w-full h-48 overflow-hidden'>
				<Link to={detailLink} className='block w-full h-full'>
					<img
						src={item?.mainImage || 'https://via.placeholder.com/150'}
						alt={item?.title || 'Product image'}
						className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
						loading='lazy'
					/>
				</Link>
			</div>

			{/* Content container */}
			<div className='p-4'>
				{/* Title and description */}
				<div className='mb-3'>
					<h3 className='text-lg font-medium line-clamp-2 text-gray-800 mb-1'>
						{item?.title}
					</h3>
					<p className='text-sm text-gray-600 line-clamp-2'>
						{item?.description}
					</p>
				</div>

				{/* Date */}
				<div className='flex items-center text-gray-500 text-sm mb-3'>
					<Calendar className='w-4 h-4 mr-2' />
					<span>{formattedDate}</span>
				</div>

				{/* Price */}
				<div className='mb-3'>
					<span className='text-lg font-semibold text-gray-900'>
						{item?.price} <span className='text-sm font-normal'>so'm</span>
					</span>
				</div>

				{/* Footer with views and like button */}
				<div className='flex items-center justify-between mt-2'>
					<div className='flex items-center text-gray-500 text-sm'>
						<Eye className='w-4 h-4 mr-1' />
						<span>{item?.viewCount}</span>
					</div>

					<button className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'>
						<Heart className='w-5 h-5 text-gray-700' />
					</button>
				</div>
			</div>
		</div>
	);
});

ItemCard.displayName = 'ItemCard';

ItemCard.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		createdAt: PropTypes.string,
		isTop: PropTypes.bool,
		mainImage: PropTypes.string,
		title: PropTypes.string,
		description: PropTypes.string,
		price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		viewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}),
	index: PropTypes.number,
};

export default ItemCard;
