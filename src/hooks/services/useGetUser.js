import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const useGetUser = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUser(decoded);
			} catch (error) {
				console.error('JWT decoding error:', error);
				setUser(null);
			}
		}
	}, []);

	return user;
};

export default useGetUser;
