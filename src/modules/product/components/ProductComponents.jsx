import { get, head, isArray, isNull } from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useGetOneQuery from '../../../hooks/api/useGetOneQuery';
import KEYS from './../../../export/keys';
import URLS from './../../../export/urls';

const ProductComponents = () => {
	const { id } = useParams();
	const [selected, setSelected] = useState(null);

	const { data } = useGetOneQuery({
		key: `${KEYS.product_detail}/${id}`,
		url: `${URLS.product_detail}/${id}`,
		enabled: !!id,
	});

	const item = !isNull(get(data, 'data.data'))
		? get(data, 'data.data', {})
		: {};

	const propertyValues = isArray(get(item, 'propertyValues'))
		? get(item, 'propertyValues', [])
		: [];

	const mainImage = selected || head(item?.files)?.file?.fileBase64;

	const renderProperties = (typeName, item) => {
		const valueType = get(typeName, 'valueTypeDto.typeName');
		let value = null;

		switch (valueType) {
			case 'STRING':
				value = get(item, 'stringValue');
				break;
			case 'BOOLEAN':
				value = get(item, 'booleanValue');
				break;
			case 'INTEGER':
				value = get(item, 'integerValue');
				break;
			case 'DOUBLE':
				value = get(item, 'doubleValue');
				break;
			default:
				return null;
		}

		if (value === null || value === undefined || value === '') {
			return null;
		}

		return (
			<div className='w-full flex justify-between items-center bg-white py-2'>
				<p className='text-[16px] font-normal leading-[16px] text-tertiary'>
					{get(get(item, 'propertyDto'), 'name')}
				</p>
				<div className='flex-1 mx-2 border-t border-dashed border-gray-300'></div>
				<p className='my-1 text-[16px] font-normal leading-[16px]'>
					{valueType === 'BOOLEAN' ? (value ? 'True' : 'False') : value}
				</p>
			</div>
		);
	};

	return (
		<div>
			<div className='container mt-10'>
				<div className='grid grid-cols-5 gap-4 auto-rows-min'>
					{/* Asosiy katta rasm joyi */}
					<div className='col-span-3 row-span-3 '>
						<div className=' w-full'>
							<div
								className={`h-[400px] select-none overflow-clip rounded-2xl border bg-gray-500/20 bg-center w-full mb-5 transition-transform duration-500 ease-in-out`}
								style={{
									backgroundImage: `url(data:image/png;base64,${mainImage})`,
									backgroundSize: 'contain',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
								}}
							></div>

							{/* Kichik rasmlar */}
							<div className='flex justify-start space-x-3 mt-1 items-center w-full'>
								{item?.files?.map((images, index) => (
									<div
										key={index}
										className={`border rounded-xl w-[130px] h-[130px] min-w-[130px] bg-cover bg-center cursor-pointer transition-transform duration-300 ease-in-out ${
											selected === images?.file?.fileBase64
												? 'scale-110 border-blue-500'
												: 'scale-100'
										}`}
										style={{
											backgroundImage: `url(data:image/png;base64,${images?.file?.fileBase64})`,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											backgroundRepeat: 'no-repeat',
										}}
										onClick={() => setSelected(images?.file?.fileBase64)}
									></div>
								))}
							</div>
						</div>
					</div>

					{/* O'ng tarafdagi bo'lim */}
					<div className='col-span-2 row-span-3'>
						<div className='w-full bg-whiteTextColor'></div>
					</div>

					{/* Pastki tafsilotlar qismi */}
					<div className='col-span-3 row-span-2  p-4 space-y-5 mb-24'>
						<div className='flex justify-start items-center space-x-3'>
							<span className='text-[12px] font-normal leading-[18px] text-[#959EA7]'>
								{get(item, 'address')}
							</span>
							<div className='w-2 h-2 bg-gray-400 rounded-full'></div>
							<span className='text-[12px] font-normal leading-[18px] text-[#959EA7]'>
								Qo’shilgan: 20 Aprel, 2022. 14:30
							</span>
						</div>
						<h1 className='font-normal text-[26px] text-[#000]'>
							{get(item, 'name')}
						</h1>
						<div className='flex justify-start my-5 items-center space-x-3'>
							<p className='text-[26px] font-semibold leading-[26px]'>
								{get(item, 'price')}
							</p>
							<p>Bo’lib to’lashga</p>
						</div>
						<hr />
						<div>
							<h1 className='text-[20px] font-semibold leading-[20px] my-5'>
								Xususiyatlar
							</h1>
							{propertyValues?.map(property =>
								renderProperties(get(property, 'propertyDto'), property)
							)}
						</div>
						<div>
							<h1 className='text-[20px] font-semibold leading-[20px] my-5'>
								Qisqacha ma’lumot
							</h1>
							<p className='break-words text-[16px] leading-[30px] font-normal'>
								{get(item, 'description')}
							</p>
						</div>
					</div>

					{/* Pastdagi o'ng taraf bo'limi */}
					<div className='col-span-2 row-span-2'>4</div>
				</div>
			</div>
		</div>
	);
};

export default ProductComponents;
