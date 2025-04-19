import { Route, Routes } from 'react-router-dom';
import HomeContainer from '../common/containers/HomeContainer';
import Layout from '../common/layout/Layout';
import AuthLayout from '../common/layout/authLayout';
import AddItem from '../modules/add-item/pages/AddItem.jsx';
import Login from '../modules/auth/pages/Login';
import CatalogPage from '../modules/catalog/pages/CatalogPage.jsx';
import ProductPages from '../modules/product/pages/ProductPages';
import UserPage from './../modules/user/pages/UserPage.jsx';
import PrivateRoute from './PrivateRoute.jsx';

export const AppRouter = () => {
	return (
		<Routes>
			<Route
				path='/'
				element={
					<PrivateRoute>
						<Layout />
					</PrivateRoute>
				}
			>
				<Route index element={<HomeContainer />} />
				<Route path='detail/:id' element={<ProductPages />} />
				<Route path='catalog/:id' element={<CatalogPage />} />
				<Route path='add-item' element={<AddItem />} />
				<Route path='user/:id' element={<UserPage />} />
			</Route>

			<Route path='/auth' element={<AuthLayout />}>
				<Route path='login' element={<Login />} />
			</Route>
		</Routes>
	);
};
