/* eslint-disable react/prop-types */
const Tabs = ({ tabs = [], activeTab = '', onTabChange }) => {
	return (
		<div className='border-b border-gray-200 flex space-x-6'>
			{tabs.map(tab => (
				<button
					key={tab.key}
					className={`py-2 px-4 text-sm font-medium ${
						activeTab === tab.key
							? 'border-b-2 border-btnColor text-btnDarkColor'
							: 'text-gray-500'
					}`}
					onClick={() => onTabChange(tab.key)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};

export default Tabs;
