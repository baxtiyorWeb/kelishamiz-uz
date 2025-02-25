import { useEffect, useState } from 'react';
import URLS from '../../../export/urls';
import usePutQuery from '../../../hooks/api/usePutQuery';
import useGetUser from '../../../hooks/services/useGetUser';

const Settings = () => {
	const user = useGetUser();
	const { mutate } = usePutQuery({});
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		secondName: '',
		email: '',
		birthDate: '',
		districtId: 7,
		address: '',
		fileItemId: 130,
	});

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				secondName: user.secondName || '',
				email: user.email || '',
				birthDate: '',
				districtId: 0,
				address: '',
				fileItemId: 0,
			});
		}
	}, [user]);

	const handleChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = e => {
		e.preventDefault();
		mutate({
			url: URLS.user_update,
			attributes: formData,
		});
	};

	return (
		<div className='max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-800'>
				Foydalanuvchi sozlamalari
			</h2>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label
							htmlFor='firstName'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Ism
						</label>
						<input
							id='firstName'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
						/>
					</div>
					<div>
						<label
							htmlFor='lastName'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Familiya
						</label>
						<input
							id='lastName'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
						/>
					</div>
				</div>
				<div>
					<label
						htmlFor='secondName'
						className='block text-sm font-medium text-gray-700 mb-1'
					>
						Otasining ismi
					</label>
					<input
						id='secondName'
						name='secondName'
						value={formData.secondName}
						onChange={handleChange}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
					/>
				</div>
				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700 mb-1'
					>
						Email
					</label>
					<input
						id='email'
						name='email'
						type='email'
						value={formData.email}
						onChange={handleChange}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
					/>
				</div>
				<div>
					<label
						htmlFor='birthDate'
						className='block text-sm font-medium text-gray-700 mb-1'
					>
						Tug'ilgan sana
					</label>
					<input
						id='birthDate'
						name='birthDate'
						type='date'
						value={formData.birthDate}
						onChange={handleChange}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
					/>
				</div>
				<div>
					<label
						htmlFor='address'
						className='block text-sm font-medium text-gray-700 mb-1'
					>
						Manzil
					</label>
					<input
						id='address'
						name='address'
						value={formData.address}
						onChange={handleChange}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-btnColor focus:border-btnColor'
					/>
				</div>
				<button
					type='submit'
					className='w-full bg-btnColor text-white py-2 px-4 rounded-md hover:bg-btnColor focus:outline-none focus:ring-2 focus:ring-btnColor focus:ring-offset-2 transition duration-200 ease-in-out'
				>
					Sozlamalarni yangilash
				</button>
			</form>
		</div>
	);
};

export default Settings;
