"use client"

import React from "react"

import { useState, useEffect } from "react"
import api from "../../../config/auth/api"
import { Phone, Lock, User, MapPin, ArrowRight, CheckCircle, AlertCircle, ChevronLeft, Shield } from "lucide-react"

export const LoginComponent = () => {
	const [phone, setPhone] = useState("")
	const [step, setStep] = useState("phone") // phone | otp | register
	const [code, setCode] = useState("")
	const [username, setUsername] = useState("")
	const [location, setLocation] = useState("")
	const [error, setError] = useState("")
	const [isNewUser, setIsNewUser] = useState(false)
	const [loading, setLoading] = useState(false)
	const [countdown, setCountdown] = useState(0)
	const [success, setSuccess] = useState("")
	const [responseCode, setResponseCode] = useState("")

	const formatPhoneNumber = (value) => {
		const cleaned = value.replace(/\D/g, "")

		// Raqamlarni formatlash
		const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})?/)
		if (!match) return ""

		// Joylarni qo'shish
		const formatted = [
			match[1], // xx
			match[2], // xxx
			match[3], // xx
			match[4], // xx
		]
			.filter(Boolean)
			.join(" ")
			.trim()

		return formatted
	}

	const handleChange = (e) => {
		const { value } = e.target
		const cleanedValue = value.replace("+998 ", "").replace(/\s/g, "")
		const formatted = formatPhoneNumber(cleanedValue)
		const finalValue = formatted ? `+998 ${formatted}` : ""
		setPhone(finalValue)
	}

	// Handle countdown timer for OTP resend
	useEffect(() => {
		let timer
		if (countdown > 0 && step === "otp") {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000)
		}
		return () => clearTimeout(timer)
	}, [countdown, step])

	// Format countdown time
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`
	}

	const handleSendPhone = async () => {
		setError("")
		setLoading(true)

		// Basic validation
		const phoneDigits = phone.replace(/\D/g, "")
		if (phoneDigits.length < 9) {
			setError("Iltimos, to'g'ri telefon raqamini kiriting")
			setLoading(false)
			return
		}

		try {
			const checkRes = await api.post("/auth/check-phone", { phone: `+${phoneDigits}` })
			setIsNewUser(!checkRes.data?.exists)

			try {
				const response = await api.post("/auth/send-otp", { phone: `+${phoneDigits}` })
				setStep("otp")
				setCountdown(120) // 2 minutes countdown
				setSuccess("Tasdiqlash kodi yuborildi")
				setResponseCode(response.data.code)
			} catch (otpError) {
				if (otpError?.response?.status === 409) {
					setStep("otp")
					setCountdown(120)
					setError("Bu telefon raqam allaqachon ro'yxatdan o'tgan. OTP kodini kiriting.")
				} else {
					setError("OTP yuborishda xatolik yuz berdi. Qayta urinib ko'ring.")
				}
			}
		} catch (checkErr) {
			setError("Telefon raqamini tekshirishda xatolik yuz berdi. Qayta urinib ko'ring.")
		} finally {
			setLoading(false)
		}
	}

	const handleVerifyOtp = async () => {
		setError("")
		setLoading(true)

		// Basic validation
		if (code.length < 4 && !responseCode) {
			setError("Iltimos, to'g'ri kodni kiriting")
			setLoading(false)
			return
		}

		try {
			const phoneDigits = phone.replace(/\D/g, "")
			const verifyRes = await api.post("/auth/verify-otp", {
				phone: `+${phoneDigits}`,
				code: responseCode || code,
			})

			if (verifyRes.data?.success) {
				if (isNewUser) {
					setStep("register")
					setSuccess("Kod tasdiqlandi. Iltimos, ma'lumotlaringizni kiriting")
				} else {
					try {
						const loginRes = await api.post("/auth/login/verify-otp", {
							phone: `+${phoneDigits}`,
							code: responseCode || code,
						})
						localStorage.setItem("accessToken", loginRes.data?.accessToken)
						localStorage.setItem("refreshToken", loginRes.data?.refreshToken)
						setSuccess("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...")

						// Redirect after showing success message
						setTimeout(() => {
							window.location.href = "/"
						}, 1500)
					} catch (loginErr) {
						setError("Tizimga kirishda xatolik yuz berdi.")
					}
				}
			} else {
				setError(verifyRes.data?.message || "OTP kodi noto'g'ri yoki muddati o'tgan.")
			}
		} catch (err) {
			setError("OTP tekshirishda xatolik yuz berdi.")
		} finally {
			setLoading(false)
		}
	}

	const handleCreateAccount = async () => {
		setError("")
		setLoading(true)

		// Basic validation
		if (!username.trim()) {
			setError("Iltimos, foydalanuvchi nomini kiriting")
			setLoading(false)
			return
		}

		if (!location.trim()) {
			setError("Iltimos, manzilingizni kiriting")
			setLoading(false)
			return
		}

		try {
			const phoneDigits = phone.replace(/\D/g, "")
			const res = await api.post("/auth/create-account", {
				phone: `+${phoneDigits}`,
				username,
				location,
			})

			localStorage.setItem("accessToken", res.data?.accessToken)
			localStorage.setItem("refreshToken", res.data?.refreshToken)

			setSuccess("Hisobingiz muvaffaqiyatli yaratildi! Yo'naltirilmoqda...")

			// Redirect after showing success message
			setTimeout(() => {
				window.location.href = "/"
			}, 1500)
		} catch (err) {
			if (err?.response?.status === 409) {
				setError("Bu telefon raqam allaqachon ro'yxatdan o'tgan.")
			} else {
				setError("Hisob yaratishda xato. Qayta urinib ko'ring.")
			}
		} finally {
			setLoading(false)
		}
	}

	const handleResendOtp = async () => {
		if (countdown > 0) return

		setError("")
		setLoading(true)

		try {
			const phoneDigits = phone.replace(/\D/g, "")
			const response = await api.post("/auth/send-otp", { phone: `+${phoneDigits}` })
			setCountdown(120) // Reset countdown
			setResponseCode(response.data?.code)
			setSuccess("Yangi tasdiqlash kodi yuborildi")
		} catch (err) {
			setError("OTP qayta yuborishda xatolik yuz berdi.")
		} finally {
			setLoading(false)
		}
	}

	const goBack = () => {
		if (step === "otp") {
			setStep("phone")
		} else if (step === "register") {
			setStep("otp")
		}
		setError("")
		setSuccess("")
	}

	return (
		<div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
			<div className="w-full">
				{/* Header with background */}
				<div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 relative">
					<div className="absolute top-0 left-0 w-full h-full opacity-10">
						{/* Background pattern */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
							<path
								fill="#fff"
								d="M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
							></path>
						</svg>
					</div>

					<div className="relative flex justify-between items-center">
						<div className="flex-1 text-center">
							<h2 className="text-2xl font-bold">
								{step === "phone" && "Kirish"}
								{step === "otp" && "Tasdiqlash"}
								{step === "register" && "Ro'yxatdan o'tish"}
							</h2>
							<p className="text-emerald-100 mt-1 text-sm">
								{step === "phone" && "Telefon raqamingizni kiriting"}
								{step === "otp" && "Tasdiqlash kodini kiriting"}
								{step === "register" && "Hisobingizni yarating"}
							</p>
						</div>
						{step !== "phone" && (
							<button onClick={goBack} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
								<ChevronLeft className="h-5 w-5" />
							</button>
						)}
					</div>
				</div>

				<div className="p-6">
					{/* Progress indicator */}
					<div className="flex mb-6">
						<div
							className={`h-1 flex-1 rounded-l-full ${step !== "phone" ? "bg-emerald-600" : "bg-emerald-600"}`}
						></div>
						<div className={`h-1 flex-1 ${step === "phone" ? "bg-gray-200" : "bg-emerald-600"}`}></div>
						<div
							className={`h-1 flex-1 rounded-r-full ${step === "register" ? "bg-emerald-600" : "bg-gray-200"}`}
						></div>
					</div>

					{/* Success message */}
					{success && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
							<CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
							<p className="text-green-700 text-sm">{success}</p>
						</div>
					)}

					{/* Error message */}
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
							<AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					)}

					{/* Phone step */}
					{step === "phone" && (
						<div className="space-y-4">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<Phone className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="text"
									value={phone}
									onChange={handleChange}
									placeholder="+998 __ ___ __ __"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
								/>
							</div>
							<button
								onClick={handleSendPhone}
								disabled={loading}
								className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
							>
								{loading ? (
									<svg
										className="animate-spin h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									<>
										Davom etish <ArrowRight className="ml-2 h-5 w-5" />
									</>
								)}
							</button>
							<p className="text-center text-sm text-gray-500 mt-4">
								Davom etish orqali siz{" "}
								<a href="#" className="text-emerald-600 hover:underline">
									Foydalanish shartlari
								</a>{" "}
								va{" "}
								<a href="#" className="text-emerald-600 hover:underline">
									Maxfiylik siyosati
								</a>
								ga rozilik bildirasiz
							</p>
						</div>
					)}

					{/* OTP step */}
					{step === "otp" && (
						<div className="space-y-4">
							<div className="text-center mb-4">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-3">
									<Shield className="h-8 w-8 text-emerald-600" />
								</div>
								<p className="text-sm text-gray-600">Kod yuborildi</p>
								<p className="font-medium text-gray-800">{phone}</p>
							</div>

							{responseCode ? (
								<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
									<div className="flex items-start">
										<CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-emerald-700 text-sm font-medium">Tasdiqlash kodi avtomatik kiritildi</p>
											<p className="text-emerald-600 text-lg font-bold mt-1">{responseCode}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="relative">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="text"
										value={code}
										onChange={(e) => setCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
										placeholder="Tasdiqlash kodi"
										className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-center font-medium text-lg tracking-widest"
										maxLength={6}
									/>
								</div>
							)}

							<button
								onClick={handleVerifyOtp}
								disabled={loading}
								className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
							>
								{loading ? (
									<svg
										className="animate-spin h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									"Tasdiqlash"
								)}
							</button>

							<div className="text-center mt-4">
								<p className="text-sm text-gray-600 mb-1">Kodni olmadingizmi?</p>
								<button
									onClick={handleResendOtp}
									disabled={countdown > 0}
									className={`text-sm font-medium ${countdown > 0 ? "text-gray-400" : "text-emerald-600 hover:text-emerald-800"
										}`}
								>
									{countdown > 0 ? `Qayta yuborish (${formatTime(countdown)})` : "Qayta yuborish"}
								</button>
							</div>
						</div>
					)}

					{/* Register step */}
					{step === "register" && (
						<div className="space-y-4">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Foydalanuvchi nomi"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
									required
								/>
							</div>

							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<MapPin className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="text"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									placeholder="Manzil"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
									required
								/>
							</div>

							<button
								onClick={handleCreateAccount}
								disabled={loading}
								className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
							>
								{loading ? (
									<svg
										className="animate-spin h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									"Ro'yxatdan o'tish"
								)}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
