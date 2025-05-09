"use client"

import { get } from "lodash"
import { Heart, MapPin, Menu, Search, User, ShoppingBag } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useGetUser from "../../hooks/services/useGetUser"
import useAuthStore from "../../store"
import { ButtonUI } from "../ui/ButtonUI"
import HeaderCatalog from "./HeaderCatalog"

const Header = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const user = useGetUser()
	const { isAuthenticated } = useAuthStore()

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}
		}

		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<header
			className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}
		>
			<div className="container mx-auto px-4 lg:px-6">
				{/* Mobile menu button - only visible on small screens */}
				<div className="flex lg:hidden items-center justify-between py-4">
					<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-emerald-600">
						<Menu size={24} />
					</button>

					<Link to={"/"} className="flex items-center">
						<img
							src={"https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"}
							alt="Logo"
							className="h-10 object-contain"
						/>
					</Link>

					<div className="flex items-center space-x-3">
						<Link to={"/profile/dashboard/favourites"} className="text-emerald-600">
							<Heart size={20} />
						</Link>
						<Link to={isAuthenticated ? `/user/${get(user, "id")}` : "/auth/login"} className="text-emerald-600">
							<User size={20} />
						</Link>
					</div>
				</div>

				{/* Mobile menu - only visible when toggled */}
				{isMobileMenuOpen && (
					<div className="lg:hidden bg-white py-4 space-y-4 border-t border-gray-100">
						<form
							onSubmit={(e) => e.preventDefault()}
							className="flex items-center justify-between rounded-md overflow-hidden border border-emerald-500"
						>
							<input
								type="text"
								placeholder="Qidiruv"
								className="h-10 flex-1 bg-[#F9F9F9] pl-4 text-gray-600 outline-none"
							/>
							<button type="submit" className="flex h-10 w-12 items-center justify-center bg-emerald-500 text-white">
								<Search size={18} />
							</button>
						</form>

						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => {
									setIsOpen(!isOpen)
									setIsMobileMenuOpen(false)
								}}
								className="flex items-center justify-center space-x-2 rounded-md bg-emerald-50 p-3 text-emerald-600"
							>
								<Menu size={18} />
								<span className="text-sm font-medium">Katalog</span>
							</button>

							<button className="flex items-center justify-center space-x-2 rounded-md bg-emerald-50 p-3 text-emerald-600">
								<MapPin size={18} />
								<span className="text-sm font-medium">Joylashuv</span>
							</button>
						</div>

						<Link
							to={"http://localhost:5173/add-item"}
							className="flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-white"
						>
							<ShoppingBag size={18} className="mr-2" />
							<span className="text-center text-sm font-medium">E'lon qo'shish</span>
						</Link>

						<div className="flex justify-between items-center pt-2 border-t border-gray-100">
							<div className="flex items-center space-x-1">
								<select className="bg-transparent text-sm text-gray-600 outline-none">
									<option value="uz">UZ</option>
									<option value="en">EN</option>
									<option value="ru">RU</option>
								</select>
							</div>
						</div>
					</div>
				)}

				{/* Desktop header - hidden on small screens */}
				<div className={`hidden lg:flex items-center justify-between py-4`}>
					<div className="flex items-center space-x-6">
						<Link to={"/"} className="flex-shrink-0">
							<img
								src={"https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"}
								alt="Logo"
								className="h-12 w-auto object-contain"
							/>
						</Link>

						<div className="flex items-center space-x-3">
							<div onClick={() => setIsOpen(!isOpen)}>
								<ButtonUI className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600">
									<Menu className="mr-2" size={18} />
									<span className="font-medium">Katalog</span>
								</ButtonUI>
							</div>
							<div>
								<ButtonUI className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600">
									<MapPin className="mr-2" size={18} />
									<span className="font-medium">Joylashuv</span>
								</ButtonUI>
							</div>
						</div>
					</div>

					<div className="w-full max-w-xl mx-4">
						<form
							onSubmit={(e) => e.preventDefault()}
							className="flex items-center justify-center w-full rounded-md overflow-hidden border border-emerald-500"
						>
							<input
								type="text"
								placeholder="Qidiruv"
								className="h-10 flex-1 bg-[#F9F9F9] pl-4 text-gray-600 outline-none"
							/>
							<button type="submit" className="flex h-10 w-12 items-center justify-center bg-emerald-500 text-white">
								<Search size={18} />
							</button>
						</form>
					</div>

					<div className="flex items-center space-x-6">
						<Link
							to={"http://localhost:5173/add-item"}
							className="flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-white transition hover:bg-emerald-700"
						>
							<span className="text-center text-sm font-medium">E'lon qo'shish</span>
						</Link>

						<Link to={"/profile/dashboard/favourites"} className="group flex flex-col items-center justify-center">
							<Heart className="text-emerald-600 group-hover:text-emerald-700 transition" size={20} />
							<span className="text-xs mt-1 text-gray-600 group-hover:text-emerald-600 transition">Sevimlilar</span>
						</Link>

						<Link
							to={isAuthenticated ? `/user/${get(user, "id")}` : "/auth/login"}
							className="group flex flex-col items-center justify-center"
						>
							<User className="text-emerald-600 group-hover:text-emerald-700 transition" size={20} />
							<span className="text-xs mt-1 text-gray-600 group-hover:text-emerald-600 transition">
								{isAuthenticated ? "Kabinet" : "Login"}
							</span>
						</Link>

						<div className="flex items-center">
							<select className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer hover:text-emerald-600 transition">
								<option value="uz">UZ</option>
								<option value="en">EN</option>
								<option value="ru">RU</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Catalog dropdown */}
			{isOpen && <HeaderCatalog setisOpen={setIsOpen} isOpen={isOpen} />}
		</header>
	)
}

export default Header
