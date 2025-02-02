import { Heart, MapPin, Menu, Search, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ButtonUI } from '../ui/ButtonUI';
import HeaderCatalog from './HeaderCatalog';

const Header = () => {
	const [isOpen, setisOpen] = useState(false);
	return (
		<>
			{isOpen && <HeaderCatalog isOpen={isOpen} />}
			<div className={`grid grid-cols-12 w-full`}>
				<div className='col-span-4 flex justify-between items-center'>
					<Link to={'/'}>
						<img
							src={'https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png'}
							alt=''
							className='h-[60px] w-[180px] object-cover'
						/>
					</Link>

					<div className='flex justify-center items-center space-x-3'>
						<div onClick={() => setisOpen(!isOpen)}>
							<ButtonUI>
								<span>
									<Menu />
								</span>
								<span>Katalog</span>
							</ButtonUI>
						</div>
						<div>
							<ButtonUI>
								<span>
									<MapPin />
								</span>
								<span>Joylashuv</span>
							</ButtonUI>
						</div>
					</div>
				</div>
				<div className='col-span-4 mx-3 flex justify-center items-center  '>
					<form
						onSubmit={e => e.preventDefault()}
						className=' flex items-center justify-center w-full rounded-md overflow-hidden border border-btnColor'
					>
						<input
							type='text'
							placeholder='Qidiruv'
							className='h-[35px] w-[480px] rounded-bl-md rounded-tl-md  bg-[#F9F9F9] pl-[19px] text-[#959EA7] outline-none '
						/>
						<button
							type='submit'
							className='flex text-textColor h-[35px] w-[50px]  items-center justify-center bg-btnColor '
						>
							<Search />
						</button>
					</form>
				</div>
				<div className='col-span-4 flex justify-end items-center  w-full'>
					<div className={'  flex justify-around items-center w-full  '}>
						<div className=' flex justify-center items-center '>
							<Link className='flex h-[35px] items-center justify-center rounded-md  bg-btnColor px-3 py-2 '>
								<span className='text text-center text-[16px] text-textColor '>
									E&apos;lon qo&apos;shish
								</span>
							</Link>
						</div>
						<div className=' flex justify-center items-center '>
							<Link
								to={'/profile/dashboard/favourites'}
								className='hover/heart relative flex flex-col items-center justify-center'
							>
								<Heart className='text text-base text-btnDarkColor hover/heart:text-bgColor' />
								<span className='text text-[16px] text-textPrimaryColor'>
									Sevimlilar
								</span>
							</Link>
						</div>
						<div className=' flex justify-center items-center '>
							<Link
								to={`#`}
								className='flex flex-col items-center justify-center'
							>
								<User className='text text-base  text-btnDarkColor font-poppins' />
								<span className='text text-[16px] text-textPrimaryColor'>
									kabinet
								</span>
							</Link>
						</div>
						<div className=' flex justify-center items-center '>
							<select name='' id=''>
								<option value=''>uz</option>
								<option value=''>en</option>
								<option value=''>ru</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Header;
