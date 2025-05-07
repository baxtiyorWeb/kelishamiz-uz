import { useState } from 'react';
import api from '../../../config/auth/api';

export const LoginComponent = () => {
	const [phone, setPhone] = useState('');
	const [step, setStep] = useState('phone'); // phone | otp | register
	const [code, setCode] = useState('');
	const [username, setUsername] = useState('');
	const [location, setLocation] = useState('');
	const [error, setError] = useState('');
	const [isNewUser, setIsNewUser] = useState(false); // Yangi foydalanuvchimi yoki yo'qmi

	const handleSendPhone = async () => {
		setError('');
		try {
			const checkRes = await api.post('/auth/check-phone', { phone });
			setIsNewUser(!checkRes.data?.exists);
			console.log(!checkRes.data?.exists);

			try {
				await api.post('/auth/send-otp', { phone });
				setStep('otp');
			} catch (otpError) {
				if (otpError?.response?.status === 409) {
					setStep('otp');
					setError(
						"Bu telefon raqam allaqachon ro'yxatdan o'tgan. OTP kodini kiriting."
					);
				} else {
					setError("OTP yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
				}
			}
		} catch (checkErr) {
			setError(
				"Telefon raqamini tekshirishda xatolik yuz berdi. Qayta urinib ko'ring."
			);
		}
	};

	const handleVerifyOtp = async () => {
		setError('');
		try {
			const verifyRes = await api.post('/auth/verify-otp', { phone, code });
			if (verifyRes.data?.success) {
				if (isNewUser) {
					setStep('register');
				} else {
					try {
						const loginRes = await api.post('/auth/login/verify-otp', {
							phone,
							code,
						});
						localStorage.setItem('accessToken', loginRes.data?.accessToken);
						localStorage.setItem('refreshToken', loginRes.data?.refreshToken);
						// window.location.href = '/';
					} catch (loginErr) {
						setError('Tizimga kirishda xatolik yuz berdi.');
					}
				}
			} else {
				setError(
					verifyRes.data?.message || "OTP kodi noto'g'ri yoki muddati o'tgan."
				);
			}
		} catch (err) {
			setError('OTP tekshirishda xatolik yuz berdi.');
		}
	};

	const handleCreateAccount = async () => {
		setError('');
		try {
			const res = await api.post('/auth/create-account', {
				phone,
				username,
				location,
			});

			localStorage.setItem('accessToken', res.data?.accessToken);
			localStorage.setItem('refreshToken', res.data?.refreshToken);
			// window.location.href = '/';
		} catch (err) {
			if (err?.response?.status === 409) {
				setError("Bu telefon raqam allaqachon ro'yxatdan o'tgan.");
			} else {
				setError("Hisob yaratishda xato. Qayta urinib ko'ring.");
			}
		}
	};

	return (
		<div className='space-y-4'>
			{step === 'phone' && (
				<div>
					<input
						type='text'
						value={phone}
						onChange={e => setPhone(e.target.value)}
						placeholder='Telefon raqam'
						className='border p-2 w-full'
					/>
					<button
						onClick={handleSendPhone}
						className='bg-blue-500 text-white px-4 py-2 mt-2'
					>
						Yuborish
					</button>
					{error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
				</div>
			)}

			{step === 'otp' && (
				<div>
					<p className='mb-2'>{phone} raqamiga yuborilgan kodni kiriting</p>
					<input
						type='text'
						value={code}
						onChange={e => setCode(e.target.value)}
						placeholder='OTP kod'
						className='border p-2 w-full'
					/>
					<button
						onClick={handleVerifyOtp}
						className='bg-green-500 text-white px-4 py-2 mt-2'
					>
						Tasdiqlash
					</button>
					{error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
				</div>
			)}

			{step === 'register' && (
				<div>
					<input
						type='text'
						value={username}
						onChange={e => setUsername(e.target.value)}
						placeholder='Foydalanuvchi nomi'
						className='border p-2 w-full'
						required
					/>
					<input
						type='text'
						value={location}
						onChange={e => setLocation(e.target.value)}
						placeholder='Manzil'
						className='border p-2 w-full mt-2'
						required
					/>
					<button
						onClick={handleCreateAccount}
						className='bg-purple-600 text-white px-4 py-2 mt-2'
					>
						Ro'yxatdan o'tish
					</button>
					{error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
				</div>
			)}
		</div>
	);
};
