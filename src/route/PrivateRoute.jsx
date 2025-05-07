import { useEffect, useState } from 'react';
import { LoginComponent } from '../common/components/auth/LoginComponent';
import useAuthStore from '../store';

const PrivateRoute = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			setShowModal(true);
		}
	}, [isAuthenticated]);

	return (
		<>
			{isAuthenticated && children}

			{showModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center '>
					<div className='relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6'>
						{/* Close button */}
						<button
							className='absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl'
							onClick={() => setShowModal(false)}
						>
							&times;
						</button>

						{/* Title */}
						<h2 className='text-lg font-semibold mb-4'>Tizimga kirish</h2>

						{/* LoginComponent - sizdagi form */}
						<LoginComponent />
					</div>
				</div>
			)}
		</>
	);
};

export default PrivateRoute;
