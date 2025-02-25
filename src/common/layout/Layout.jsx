import { Outlet } from 'react-router-dom';
import Container from '../components/Container';
import Header from '../components/Header';

const Layout = () => {
	return (
		<Container>
			<Header />
			<div className='min-h-screen flex-grow-0 p-1'>
				<Outlet />
			</div>
		</Container>
	);
};

export default Layout;
