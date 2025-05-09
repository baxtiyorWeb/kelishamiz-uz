"use client"

import { useMemo } from "react"

import { get, isArray, isNull } from "lodash"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
	Heart,
	Phone,
	MessageCircle,
	ArrowLeft,
	MapPin,
	Eye,
	Calendar,
	Tag,
	ChevronLeft,
	ChevronRight,
} from "lucide-react"
import useGetOneQuery from "../../../hooks/api/useGetOneQuery"
import KEYS from "./../../../export/keys"
import URLS from "./../../../export/urls"

const ProductDetail = () => {
	const { id } = useParams()
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [activeTab, setActiveTab] = useState("description")
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
	const [isLiked, setIsLiked] = useState(false)

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768)
		}

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	const { data, isLoading } = useGetOneQuery({
		key: `${KEYS.product_detail}/${id}`,
		url: `${URLS.product_detail}/${id}`,
		enabled: !!id,
	})

	const item = !isNull(get(data, "data.content")) ? get(data, "data.content", {}) : {}

	// Process images from the API response
	const processedImages = useMemo(() => {
		const images = get(item, "images", [])
		if (!isArray(images) || images.length === 0) {
			return []
		}

		// Sort images so the main image comes first
		return [...images].sort((a, b) => {
			if (a.isMainImage) return -1
			if (b.isMainImage) return 1
			return 0
		})
	}, [item])

	// Set main image as selected image when data loads
	useEffect(() => {
		if (processedImages.length > 0) {
			setSelectedImageIndex(0)
		}
	}, [processedImages])

	// Get the currently selected image URL
	const selectedImageUrl = processedImages[selectedImageIndex]?.url || ""

	// Default image if no images are available
	const defaultImage = "https://via.placeholder.com/600x400?text=No+Image+Available"

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return ""
		const date = new Date(dateString)
		const day = date.getDate()
		const month = date.toLocaleString("default", { month: "long" })
		const year = date.getFullYear()
		const hours = date.getHours()
		const minutes = date.getMinutes().toString().padStart(2, "0")

		return `${day} ${month}, ${year}. ${hours}:${minutes}`
	}

	// Format price with currency
	const formatPrice = (price) => {
		if (!price) return ""
		const numPrice = Number.parseFloat(price)
		return new Intl.NumberFormat("uz-UZ").format(numPrice)
	}

	// Handle like button click
	const handleLikeClick = () => {
		setIsLiked(!isLiked)
		// Here you would typically call an API to update the like status
	}

	// Navigate to previous image
	const prevImage = () => {
		setSelectedImageIndex((prev) => (prev === 0 ? processedImages.length - 1 : prev - 1))
	}

	// Navigate to next image
	const nextImage = () => {
		setSelectedImageIndex((prev) => (prev === processedImages.length - 1 ? 0 : prev + 1))
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
			</div>
		)
	}

	return (
		<div className="bg-gray-50 min-h-screen pb-20 md:pb-16">
			{/* Mobile Header */}
			{isMobile && (
				<div className="sticky top-0 z-10 bg-white shadow-sm">
					<div className="container mx-auto px-4 py-3 flex items-center justify-between">
						<button className="p-2 -ml-2 text-emerald-600" onClick={() => window.history.back()}>
							<ArrowLeft size={20} />
						</button>
						<h1 className="text-lg font-medium truncate max-w-[200px]">{item?.title}</h1>
						<div className="flex items-center">
							<button className="p-2 relative" onClick={handleLikeClick}>
								<Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : "text-emerald-600"} />
								{item?.likesCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
										{item.likesCount}
									</span>
								)}
							</button>
							<button className="p-2 relative ml-1 text-emerald-600">
								<MessageCircle size={20} />
								{item?.commentsCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
										{item.commentsCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="container mx-auto px-4 py-4 md:py-8">
				{/* Breadcrumbs - Desktop only */}
				<div className="hidden md:flex items-center text-sm text-gray-500 mb-6">
					<a href="/" className="hover:text-emerald-600 transition-colors">
						Bosh sahifa
					</a>
					<span className="mx-2">/</span>
					<a href="/products" className="hover:text-emerald-600 transition-colors">
						Mahsulotlar
					</a>
					<span className="mx-2">/</span>
					<span className="text-gray-700 truncate max-w-[200px]">{item?.title}</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8">
					{/* Left Column - Images and Properties */}
					<div className="md:col-span-1 lg:col-span-3">
						{/* Main Image */}
						<div className="bg-white rounded-lg shadow-sm overflow-hidden">
							<div className="relative h-[300px] md:h-[400px] w-full bg-gray-100 flex items-center justify-center">
								{processedImages.length > 0 ? (
									<>
										<img
											src={selectedImageUrl || defaultImage}
											alt={item?.title}
											className="h-full w-full object-contain"
										/>

										{/* Image navigation buttons */}
										{processedImages.length > 1 && (
											<>
												<button
													onClick={prevImage}
													className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-emerald-600 p-2 rounded-full shadow-md transition-all"
												>
													<ChevronLeft size={20} />
												</button>
												<button
													onClick={nextImage}
													className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-emerald-600 p-2 rounded-full shadow-md transition-all"
												>
													<ChevronRight size={20} />
												</button>
											</>
										)}
									</>
								) : (
									<div
										className="h-full w-full bg-cover bg-center"
										style={{ backgroundImage: `url(${defaultImage})` }}
									></div>
								)}

								{/* Like Button - Overlay */}
								<button
									onClick={handleLikeClick}
									className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
								>
									<Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : "text-emerald-600"} />
								</button>

								{/* Image Counter - Mobile only */}
								{isMobile && processedImages.length > 1 && (
									<div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
										{selectedImageIndex + 1} / {processedImages.length}
									</div>
								)}
							</div>

							{/* Thumbnails */}
							{processedImages.length > 1 && (
								<div className="p-4 overflow-x-auto">
									<div className="flex space-x-3">
										{processedImages.map((image, index) => (
											<div
												key={index}
												className={`border rounded-lg w-16 h-16 md:w-20 md:h-20 min-w-[4rem] md:min-w-[5rem] bg-gray-100 cursor-pointer transition-all duration-200 ${selectedImageIndex === index
													? "ring-2 ring-emerald-500 scale-105"
													: "hover:ring-1 hover:ring-gray-300"
													}`}
												onClick={() => setSelectedImageIndex(index)}
											>
												<img
													src={image.url || "/placeholder.svg"}
													alt={`Thumbnail ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Product Properties - Moved below image */}
						<div className="mt-6 space-y-4 bg-white rounded-lg shadow-sm p-4 md:p-6">
							<div className="space-y-1">
								<h2 className="text-lg font-semibold mb-4 text-gray-800">Qisqacha ma'lumot</h2>
								<p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
									{item?.description || "Mahsulot haqida ma'lumot mavjud emas."}
								</p>
							</div>
							<div>
								<h2 className="text-lg font-semibold mb-4 text-gray-800">Xususiyatlar</h2>
								<div className="space-y-1">
									{isArray(item?.propertyValues) && item?.propertyValues.length > 0 ? (
										item.propertyValues.map((property, index) => (
											<div
												key={index}
												className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
											>
												<p className="text-gray-600 font-medium">{property?.value?.key}</p>
												<div className="flex-1 mx-4 border-t border-dashed border-gray-200 hidden md:block"></div>
												<p className="text-gray-900 font-medium">{property?.value?.value}</p>
											</div>
										))
									) : (
										<p className="text-gray-500 italic">Xususiyatlar haqida ma'lumot mavjud emas.</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Product Info */}
					<div className="md:col-span-1 lg:col-span-2">
						<div className="bg-white rounded-lg shadow-sm p-4 md:p-6 md:sticky md:top-4">
							{/* Location and Date */}
							<div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 md:mb-4 flex-wrap">
								<div className="flex items-center">
									<MapPin size={14} className="mr-1 text-emerald-500" />
									<span>
										{item?.region?.name} {item?.district?.name && `, ${item?.district?.name}`}
									</span>
								</div>
								<div className="w-1 h-1 bg-gray-400 rounded-full mx-2"></div>
								<div className="flex items-center">
									<Calendar size={14} className="mr-1 text-emerald-500" />
									<span>Qo'shilgan: {formatDate(item?.createdAt)}</span>
								</div>
							</div>

							{/* Title - Desktop only */}
							<h1 className="hidden md:block text-xl lg:text-2xl font-bold text-gray-900 mb-4">{item?.title}</h1>

							{/* Price */}
							<div className="mb-4 md:mb-6">
								<div className="flex items-baseline flex-wrap">
									<span className="text-2xl md:text-3xl font-bold text-emerald-700">
										{formatPrice(item?.price)} {item?.currencyType}
									</span>
									{item?.negotiable && (
										<span className="ml-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
											Narxi kelishiladi
										</span>
									)}
								</div>
								<div className="mt-1 text-sm text-gray-600">
									<span className="font-medium flex items-center">
										<Tag size={14} className="mr-1 text-emerald-500" />
										{item?.paymentType}
									</span>
								</div>
							</div>

							{/* Contact Information - Always visible */}
							<div className="mb-6 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
								<h3 className="text-lg font-semibold mb-3 text-gray-800">Sotuvchi bilan bog'lanish</h3>
								<div className="flex items-center">
									<div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
										{item?.profile?.fullName?.charAt(0) || "S"}
									</div>
									<div className="ml-3">
										<p className="font-medium">{item?.profile?.fullName || "Sotuvchi"}</p>
										<p className="text-sm font-medium text-emerald-600">
											{item?.profile?.phoneNumber || "Telefon raqam ko'rsatilmagan"}
										</p>
										{item?.profile?.location && <p className="text-xs text-gray-500 mt-1">{item.profile.location}</p>}
									</div>
								</div>
								<div className="mt-4 flex space-x-3">
									<button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
										<Phone size={16} className="mr-2" />
										Qo'ng'iroq qilish
									</button>
									<button className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
										<MessageCircle size={16} className="mr-2" />
										Xabar yozish
									</button>
								</div>
							</div>

							{/* Social Stats with Like Button */}
							<div className="flex items-center space-x-4 mb-6">
								<button
									onClick={handleLikeClick}
									className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
										? "bg-red-50 text-red-500 border border-red-200"
										: "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
										}`}
								>
									<Heart size={18} className={isLiked ? "fill-red-500" : ""} />
									<span>{item?.likesCount || 0}</span>
								</button>
								<div className="flex items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
									<Eye size={18} className="mr-2" />
									<span>Ko'rishlar: {item?.viewCount || 0}</span>
								</div>
							</div>

							{/* Location Info */}
							{(item?.region?.name || item?.district?.name) && (
								<div className="mt-4 pt-4 border-t border-gray-100">
									<div className="flex justify-between items-center">
										<span className="text-gray-500 flex items-center">
											<MapPin size={16} className="mr-1 text-emerald-500" />
											Joylashuv:
										</span>
										<span className="font-medium">
											{item?.region?.name} {item?.district?.name && `, ${item?.district?.name}`}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Sticky Footer - Mobile only */}
			{isMobile && (
				<div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 flex space-x-3">
					<button className="flex-1 bg-white border border-emerald-600 text-emerald-600 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center">
						<Phone size={16} className="mr-2" />
						Qo'ng'iroq qilish
					</button>
					<button className="flex-1 bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center">
						<MessageCircle size={16} className="mr-2" />
						Xabar yozish
					</button>
				</div>
			)}
		</div>
	)
}

export default ProductDetail
