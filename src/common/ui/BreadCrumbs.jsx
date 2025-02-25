'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KEYS from '../../export/keys';
import URLS from '../../export/urls';
import useGetOneQuery from '../../hooks/api/useGetOneQuery';

const Breadcrumbs = () => {
	const [breadcrumbs, setBreadcrumbs] = useState([]);
	const [rootCategoryId, setRootCategoryId] = useState(null);
	const navigate = useNavigate();
	const { id } = useParams();

	const { data } = useGetOneQuery({
		key: `${KEYS.category}/${id}`,
		url: `${URLS.category}/${id}`,
		enabled: !!id,
	});

	useEffect(() => {
		const fetchBreadcrumbs = async () => {
			let currentCategory = data?.data?.data;
			const breadcrumbItems = [];

			while (currentCategory) {
				breadcrumbItems.unshift({
					id: currentCategory.id,
					name: currentCategory.name,
				});

				// Agar parent null bo'lsa, bu root category
				if (!currentCategory.parent) {
					setRootCategoryId(currentCategory.id);
				}

				currentCategory = currentCategory?.parent;
			}

			setBreadcrumbs(breadcrumbItems);
		};

		if (data?.data) {
			fetchBreadcrumbs();
		}
	}, [data]);

	const handleClick = categoryId => {
		navigate(`/catalog/${categoryId || ''}`);
	};

	return (
		<nav className='flex items-center space-x-2 text-gray-600 text-sm'>
			{id && id !== rootCategoryId && (
				<span
					className='cursor-pointer text-btnColor hover:underline'
					onClick={() => navigate(`/catalog/${rootCategoryId}`)}
				>
					Bosh Kategoriya
				</span>
			)}
			{breadcrumbs.map((crumb, index) => (
				<div key={crumb.id} className='flex items-center my-3'>
					<button
						onClick={() => handleClick(crumb.id)}
						className='cursor-pointer text-btnColor hover:underline flex space-x-2'
					>
						<span className='text-btnDarkColor'>/</span>
						<span>{crumb.name}</span>
					</button>
				</div>
			))}
		</nav>
	);
};

export default Breadcrumbs;
