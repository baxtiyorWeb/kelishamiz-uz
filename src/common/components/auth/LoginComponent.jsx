"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Lock,
  User,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Shield,
} from "lucide-react";
import api from "../../../config/auth/api";

const LoginComponent = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp | register
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState("");
  const [responseCode, setResponseCode] = useState("");

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");

    // Format the numbers
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})?/);
    if (!match) return "";

    // Add spaces
    const formatted = [
      match[1], // xx
      match[2], // xxx
      match[3], // xx
      match[4], // xx
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return formatted;
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const cleanedValue = value.replace("+998 ", "").replace(/\s/g, "");
    const formatted = formatPhoneNumber(cleanedValue);
    const finalValue = formatted ? `+998 ${formatted}` : "";
    setPhone(finalValue);
  };

  // Handle countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0 && step === "otp") {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSendPhone = async () => {
    setError("");
    setLoading(true);

    // Basic validation
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      setError("Iltimos, to'g'ri telefon raqamini kiriting");
      setLoading(false);
      return;
    }

    try {
      const checkRes = await api.post("/auth/check-phone", {
        phone: `+${phoneDigits}`,
      });
      setIsNewUser(!checkRes.data?.exists);

      try {
        const response = await api.post("/auth/send-otp", {
          phone: `+${phoneDigits}`,
        });
        setStep("otp");
        setCountdown(120); // 2 minutes countdown
        setSuccess("Tasdiqlash kodi yuborildi");
        setResponseCode(response.data.code);
      } catch (otpError) {
        if (otpError?.response?.status === 409) {
          setStep("otp");
          setCountdown(120);
          setError(
            "Bu telefon raqam allaqachon ro'yxatdan o'tgan. OTP kodini kiriting."
          );
        } else {
          setError("OTP yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
        }
      }
    } catch (checkErr) {
      setError(
        "Telefon raqamini tekshirishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    // Basic validation
    if (code.length < 4 && !responseCode) {
      setError("Iltimos, to'g'ri kodni kiriting");
      setLoading(false);
      return;
    }

    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const verifyRes = await api.post("/auth/verify-otp", {
        phone: `+${phoneDigits}`,
        code: responseCode || code,
      });

      if (verifyRes.data?.success) {
        if (isNewUser) {
          setStep("register");
          setSuccess("Kod tasdiqlandi. Iltimos, ma'lumotlaringizni kiriting");
        } else {
          try {
            const loginRes = await api.post("/auth/login/verify-otp", {
              phone: `+${phoneDigits}`,
              code: responseCode || code,
            });
            localStorage.setItem("accessToken", loginRes.data?.accessToken);
            localStorage.setItem("refreshToken", loginRes.data?.refreshToken);
            setSuccess("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...");

            // Redirect after showing success message
            setTimeout(() => {
              window.location.href = "/";
            }, 1500);
          } catch (loginErr) {
            setError("Tizimga kirishda xatolik yuz berdi.");
          }
        }
      } else {
        setError(
          verifyRes.data?.message || "OTP kodi noto'g'ri yoki muddati o'tgan."
        );
      }
    } catch (err) {
      setError("OTP tekshirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      setError("Iltimos, foydalanuvchi nomini kiriting");
      setLoading(false);
      return;
    }

    if (!location.trim()) {
      setError("Iltimos, manzilingizni kiriting");
      setLoading(false);
      return;
    }

    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const res = await api.post("/auth/create-account", {
        phone: `+${phoneDigits}`,
        username,
        location,
      });

      localStorage.setItem("accessToken", res.data?.accessToken);
      localStorage.setItem("refreshToken", res.data?.refreshToken);

      setSuccess("Hisobingiz muvaffaqiyatli yaratildi! Yo'naltirilmoqda...");

      // Redirect after showing success message
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError("Bu telefon raqam allaqachon ro'yxatdan o'tgan.");
      } else {
        setError("Hisob yaratishda xato. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    setLoading(true);

    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const response = await api.post("/auth/send-otp", {
        phone: `+${phoneDigits}`,
      });
      setCountdown(120); // Reset countdown
      setResponseCode(response.data?.code);
      setSuccess("Yangi tasdiqlash kodi yuborildi");
    } catch (err) {
      setError("OTP qayta yuborishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else if (step === "register") {
      setStep("otp");
    }
    setError("");
    setSuccess("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex w-full min-h-screen  items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="relative overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-teal-500/10"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-teal-300/20"
          ></motion.div>

          <div className="relative z-10 bg-gradient-to-r from-teal-500 to-teal-600 pb-6 pt-6 text-white px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <motion.div
                  key={`header-${step}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <h2 className="text-2xl font-bold">
                    {step === "phone" && "Kirish"}
                    {step === "otp" && "Tasdiqlash"}
                    {step === "register" && "Ro'yxatdan o'tish"}
                  </h2>
                  <p className="mt-1 text-sm text-teal-100">
                    {step === "phone" && "Telefon raqamingizni kiriting"}
                    {step === "otp" && "Tasdiqlash kodini kiriting"}
                    {step === "register" && "Hisobingizni yarating"}
                  </p>
                </motion.div>
              </div>
              {step !== "phone" && (
                <motion.button
                  onClick={goBack}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Progress indicator */}
            <div className="mb-6 flex">
              <motion.div
                className="h-1 flex-1 rounded-l-full bg-teal-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              ></motion.div>
              <motion.div
                className={`h-1 flex-1 ${
                  step === "phone" ? "bg-gray-200" : "bg-teal-500"
                }`}
                initial={{ scaleX: step === "phone" ? 0 : 1 }}
                animate={{ scaleX: step !== "phone" ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              ></motion.div>
              <motion.div
                className={`h-1 flex-1 rounded-r-full ${
                  step === "register" ? "bg-teal-500" : "bg-gray-200"
                }`}
                initial={{ scaleX: step === "register" ? 1 : 0 }}
                animate={{ scaleX: step === "register" ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
              ></motion.div>
            </div>

            {/* Success message */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  className="mb-4 flex items-start rounded-lg border border-green-200 bg-green-50 p-3"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm text-green-700">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-3"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form steps */}
            <AnimatePresence mode="wait">
              {/* Phone step */}
              {step === "phone" && (
                <motion.div
                  className="space-y-4"
                  key="phone-step"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="relative" variants={itemVariants}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSendPhone}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      {loading ? (
                        <svg
                          className="h-5 w-5 animate-spin text-white"
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
                  </motion.div>
                  <motion.p
                    className="mt-4 text-center text-sm text-gray-500"
                    variants={itemVariants}
                  >
                    Davom etish orqali siz{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Foydalanish shartlari
                    </a>{" "}
                    va{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Maxfiylik siyosati
                    </a>
                    ga rozilik bildirasiz
                  </motion.p>
                </motion.div>
              )}

              {/* OTP step */}
              {step === "otp" && (
                <motion.div
                  className="space-y-4"
                  key="otp-step"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div
                    className="mb-4 text-center"
                    variants={itemVariants}
                  >
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                      <Shield className="h-8 w-8 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-600">Kod yuborildi</p>
                    <p className="font-medium text-gray-800">{phone}</p>
                  </motion.div>

                  {responseCode ? (
                    <motion.div
                      className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-4"
                      variants={itemVariants}
                    >
                      <div className="flex items-start">
                        <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
                        <div>
                          <p className="text-sm font-medium text-teal-700">
                            Tasdiqlash kodi avtomatik kiritildi
                          </p>
                          <p className="mt-1 text-lg font-bold text-teal-600">
                            {responseCode}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div className="relative" variants={itemVariants}>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) =>
                          setCode(
                            e.target.value.replace(/\D/g, "").substring(0, 6)
                          )
                        }
                        placeholder="Tasdiqlash kodi"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-center font-medium text-lg tracking-widest"
                        maxLength={6}
                      />
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      {loading ? (
                        <svg
                          className="h-5 w-5 animate-spin text-white"
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
                  </motion.div>

                  <motion.div
                    className="mt-4 text-center"
                    variants={itemVariants}
                  >
                    <p className="mb-1 text-sm text-gray-600">
                      Kodni olmadingizmi?
                    </p>
                    <button
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      className={`text-sm font-medium ${
                        countdown > 0
                          ? "text-gray-400"
                          : "text-teal-600 hover:text-teal-800"
                      }`}
                    >
                      {countdown > 0
                        ? `Qayta yuborish (${formatTime(countdown)})`
                        : "Qayta yuborish"}
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* Register step */}
              {step === "register" && (
                <motion.div
                  className="space-y-4"
                  key="register-step"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="relative" variants={itemVariants}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Foydalanuvchi nomi"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </motion.div>

                  <motion.div className="relative" variants={itemVariants}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Manzil"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleCreateAccount}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      {loading ? (
                        <svg
                          className="h-5 w-5 animate-spin text-white"
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
