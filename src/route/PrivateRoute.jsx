/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store';

export const PrivateRoute = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	console.log(isAuthenticated);

	return isAuthenticated ? <>{children}</> : <Navigate to='/auth/login' />;
};
