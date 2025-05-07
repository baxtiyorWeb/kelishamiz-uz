/* eslint-disable react/prop-types */
import { format } from 'date-fns';
import { get } from 'lodash';
import { Calendar, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
const ItemCard = ({ item, index }) => {
	return (
		<div
			className={` ${
				index ? 'animation' : ''
			} relative   flex-shrink-0 rounded-md  pt-2 transition-all hover:shadow-lg xs:h-[368px] `}
		>
			<span className='absolute left-3 top-5 z-50 bg-red-500 px-1 text-sm text-white'>
				TOP
			</span>
			<div className='relative h-[230px] w-full xs:h-[150px] xs:w-[100%]'>
				<div className='cart-slider group flex h-full items-center justify-center'>
					<Link
						to={`/detail/${get(item, 'id')}?infoTab=1`}
						className='w-full xs:flex xs:h-[100%_!important] xs:w-[163px_!important] xs:items-center xs:justify-center'
					>
						<div className='h-[200px]  xs:h-[100%_!important] xs:w-[100%_!important]'>
							<img
								src={`${get(item, 'mainImage')}`}
								alt='img'
								width={'100%'}
								height={'200px'}
								className='h-[100%_!important] w-[100%_!important] rounded-xl bg-center object-cover align-middle xs:h-[150px_!important] xs:w-[145px_!important]'
							/>
						</div>
					</Link>
				</div>
			</div>
			<div className='mb-3 mt-4 h-[100px] xs:h-[80px]'>
				<div className='h-14 xs:h-8'>
					<span className='text wrap line-clamp-2 font-poppins text-[20px] font-light not-italic leading-[120%] tracking-[-0.32px] text-textDarkColor  xs:text-[13px]'>
						{get(item, 'title')}
					</span>
					<p className='line-clamp-2'>{get(item, 'description')}</p>
				</div>
				<div className='mt-3 rounded-xl'>
					<div className='text-xs xs:my-3'>
						<div className='text mt-3 flex flex-col items-start justify-start font-poppins text-[14px] font-normal leading-[100%] tracking-[-0.22px] text-textPrimaryColor xs:mt-3 xs:text-[10px]'>
							<p className='text mt-3 flex items-center justify-between font-poppins text-[13px] font-normal leading-[100%] tracking-[-0.22px] text-textPrimaryColor xs:text-sm'>
								<div className='flex items-center justify-center'>
									<Calendar className='mr-3' />
									<span className='xs:text-sm'>
										{format(new Date(get(item, 'createdAt')), 'dd MMM yyyy')}
									</span>
								</div>
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex h-20 flex-col justify-between'></div>
			<div className='flex h-20 flex-col justify-between'>
				<span className='text inline-flex w-max items-center rounded-md px-2 py-2 font-poppins text-[18px] font-medium not-italic leading-[100%]  text-textDarkColor xs:py-1 xs:text-sm'>
					{get(item, 'price')}
					<p className='ml-1'>so{"'"}m</p>
				</span>
			</div>
			<span className='flex items-center justify-center'>
				<Eye className='mr-3 text-[16px]' />
				{get(item, 'viewCount')}
			</span>
			<div className='flex items-center justify-center'>
				<span
					className={`
						 mx-1 flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-md bg-bgColor text-whiteTextColor hover:text-whiteTextColor
					`}
				>
					<Heart className='cursor-pointer text-[28px]' />
				</span>
			</div>
		</div>
	);
};

export default ItemCard;
