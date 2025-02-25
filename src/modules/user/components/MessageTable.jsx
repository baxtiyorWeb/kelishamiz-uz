import { get } from 'lodash';
import { useEffect, useState } from 'react';
import URLS from '../../../export/urls';
import usePostQuery from '../../../hooks/api/usePostQuery';
import useGetUser from '../../../hooks/services/useGetUser';
import Settings from '../pages/Settings';
import Table from './ui/Table';
import Tabs from './ui/Tabs';

const columns = [
	{ key: 'img', title: 'RASM' },
	{ key: 'name', title: 'TITLE' },
	{ key: 'description', title: 'QISQACHA' },
	{ key: 'price', title: 'NARXI' },
	{ key: 'date', title: 'SANA' },
	{ key: 'viewCount', title: 'kurilganlar' },
	{ key: 'canAgree', title: 'kelishish' },

	{
		key: 'status',
		title: "KO'RISH",
		render: (value, record) => (
			<button
				className='text-gray-600 hover:text-gray-900'
				onClick={() => console.log('Clicked:', record.id)}
			>
				{value}
			</button>
		),
	},
];

const tabs = [
	{ key: 'elonlar', label: "E'lonlar" },
	{ key: 'xabarlari', label: 'Xabarlarim' },
	{ key: 'saqlangan', label: 'Saqlanganlar' },
	{ key: 'qidiruv', label: 'Qidiruvlar' },
	{ key: 'hisobim', label: 'Mening hisobim' },
	{ key: 'sozlamalar', label: 'Sozlamalar' },
];

const MessagesTable = () => {
	const [activeTab, setActiveTab] = useState('elonlar');
	const [search, setSearch] = useState('');
	const [messages, setMessages] = useState([]);
	const user = useGetUser();
	const { mutate } = usePostQuery({});

	useEffect(() => {
		mutate(
			{
				url: URLS.product_list,
				attributes: {
					search: '',
					page: 0,
					size: 10,
					lang: 'uz',
					categoryId: 0,
					districtId: 0,
					regionId: 0,
					paymentTypeId: 0,
					sellTypeId: 0,
					ownProducts: true,
					userId: user?.id,
					price: null,
					canAgree: true,
					valueFilter: [],
					productIdList: [],
				},
			},
			{
				onSuccess: data => {
					const items = data?.data?.data;
					const formattedMessages = items?.map(item => ({
						id: item.id,
						img: item?.file && (
							<div className='w-[120px]'>
								<img
									src={`data:${item.file.contentType};base64,${item.file.fileBase64}`}
									alt={item.name}
									className='w-32  h-32 object-cover rounded-lg mt-2'
								/>
							</div>
						),
						name: item.name,
						description: (
							<div className='border flex items-center gap-2 w-[350px]  break-words line-clamp-2'>
								{get(item, 'description')}
							</div>
						),
						price: get(item, 'price'),
						viewCount: get(item, 'viewCount'),
						canAgree: get(item, 'canAgree') ? 'yes' : 'no',
						date: new Date().toLocaleDateString('Uz-uz'),
						status: "Ko'rish",
					}));

					console.log('Formatted Messages:', formattedMessages);
					setMessages(formattedMessages);
				},
			}
		);
	}, [user, mutate]);

	return (
		<div className=''>
			<h1 className='text-2xl font-semibold mb-3'>Profil</h1>

			<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

			<div className='mt-8 flex justify-between items-center '>
				<div className='flex space-x-2'>
					<button className='w-[116px] bg-btnColor px-4 py-2 text-white  rounded-lg'>
						Faol
					</button>
					<button className='px-4 py-2 bg-gray-200 rounded-lg'>No faol</button>
				</div>
				<input
					type='text'
					className='border rounded-lg px-4 py-2 text-sm'
					placeholder='Mahsulot izlash'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<div className='mt-12'>
				{activeTab === 'elonlar' && (
					<Table columns={columns} data={messages} rowKey='id' />
				)}
				{activeTab === 'sozlamalar' && <Settings />}
			</div>
		</div>
	);
};

export default MessagesTable;
