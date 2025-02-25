'use client';

import { get, head, isArray, isEqual, isNil } from 'lodash';
import { useEffect, useState } from 'react';
import KEYS from '../../export/keys.js';
import URLS from '../../export/urls.js';
import usePaginateQuery from '../../hooks/api/usePaginateQuery.js';

const HeaderCatalog = ({ isOpen, setisOpen }) => {
	const [selected, setSelected] = useState(null);
	const { data: parentList } = usePaginateQuery({
		key: KEYS.categories,
		url: URLS.categories,
		enabled: !!isOpen,
	});

	const parents = isArray(get(parentList, 'data.data', []))
		? get(parentList, 'data.data', [])
		: [];

	useEffect(() => {
		if (isNil(selected)) {
			setSelected(head(parents));
		}
	}, [parents, selected]);

	const childCategories = get(selected, 'childCategories', []);
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'unset';

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	return (
		isOpen && (
			<div
				className='fixed inset-0 z-[999999] flex items-start justify-center pt-20 bg-black bg-opacity-50'
				onClick={() => setisOpen(!isOpen)}
			>
				<div
					className='w-11/12 max-w-5xl rounded-lg bg-white shadow-2xl'
					onClick={e => e.stopPropagation()}
				>
					<div className='flex h-[80vh]  overflow-auto rounded-lg text-xs'>
						<div className='w-1/5 bg-btnColor p-2 overflow-y-auto'>
							{parents?.map(item => (
								<button
									className={`mb-1 w-full flex justify-between items-center rounded px-2 py-2 text-left transition-colors ${
										isEqual(get(item, 'id'), get(selected, 'id'))
											? 'bg-white text-btnColor'
											: 'text-white hover:bg-white hover:bg-opacity-20'
									}`}
									key={get(item, 'id')}
									onClick={() => setSelected(item)}
								>
									<span className='truncate'>{get(item, 'name')}</span>
									{isEqual(get(item, 'id'), get(selected, 'id')) && (
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='ml-1 inline-block h-3 w-3'
											viewBox='0 0 20 20'
											fill='currentColor'
										>
											<path
												fillRule='evenodd'
												d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
												clipRule='evenodd'
											/>
										</svg>
									)}
								</button>
							))}
						</div>
						<div className='w-full bg-white p-4 overflow-y-auto'>
							<h1 className='mb-3 text-lg font-bold text-btnColor'>
								{get(selected, 'name')}
							</h1>
							<div className='mb-3 h-px bg-gray-200'></div>
							<div className='grid grid-cols-3 gap-6'>
								{childCategories?.map(category => (
									<div
										key={get(category, 'id')}
										className='bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300'
									>
										{get(category, 'name') && (
											<>
												<h2 className='text-sm font-bold text-btnColor mb-2 pb-2 border-b border-gray-200'>
													{get(category, 'name')}
												</h2>
											</>
										)}
										<ul className='space-y-1'>
											{isArray(get(category, 'childCategories', [])) &&
												get(category, 'childCategories')?.map(item => (
													<li
														key={get(item, 'id')}
														className='text-xs text-gray-600 hover:text-btnColor hover:bg-white cursor-pointer p-1 rounded transition-colors duration-200'
													>
														{get(item, 'name')}
													</li>
												))}
										</ul>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	);
};

export default HeaderCatalog;
