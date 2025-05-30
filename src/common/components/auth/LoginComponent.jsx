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

// API configuration - siz o'zingizning API base URL ingizni kiriting

const LoginComponent = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp | register
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState("");
  const [responseCode, setResponseCode] = useState("");

  // Fetch regions when step becomes register
  useEffect(() => {
    if (step === "register") {
      fetchRegionsData();
    }
  }, [step]);

  const fetchRegionsData = async () => {
    try {
      const response = await api.get("/location/regions");
      const data = await response.data;
      if (data?.content) {
        setRegions(data.content);
      }
    } catch (err) {
      setError("Viloyatlarni yuklashda xatolik yuz berdi");
    }
  };

  const handleRegionChange = (e) => {
    const selectedRegionId = e.target.value;
    setRegionId(selectedRegionId);
    setDistrictId(""); 

    const selectedRegion = regions.find(
      (r) => r.id === parseInt(selectedRegionId)
    );
    setDistricts(selectedRegion ? selectedRegion.districts : []);
  };

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

        // OTP ni auto kiritish
        if (response.data.code) {
          setTimeout(() => {
            setCode(response.data.code);
          }, 1000);
        }
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

    if (!regionId) {
      setError("Iltimos, viloyatni tanlang");
      setLoading(false);
      return;
    }

    if (!districtId) {
      setError("Iltimos, tumanni tanlang");
      setLoading(false);
      return;
    }

    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const res = await api.post("/auth/create-account", {
        phone: `+${phoneDigits}`,
        username,
        regionId: parseInt(regionId),
        districtId: parseInt(districtId),
      });

      localStorage.setItem("accessToken", res.data?.content?.accessToken);
      localStorage.setItem("refreshToken", res.data?.content?.refreshToken);

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
    <div className="flex w-full min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 p-4">
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

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Phone Step */}
                {step === "phone" && (
                  <>
                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={handleChange}
                          placeholder="+998 90 123 45 67"
                          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-3 text-sm placeholder-gray-500 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <button
                        onClick={handleSendPhone}
                        disabled={loading || !phone}
                        className="group relative w-full overflow-hidden rounded-lg bg-teal-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="relative flex items-center justify-center">
                          {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              Davom etish
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </span>
                      </button>
                    </motion.div>
                  </>
                )}

                {/* OTP Step */}
                {step === "otp" && (
                  <>
                    <motion.div variants={itemVariants}>
                      <div className="text-center">
                        <div className="mb-2">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                            <Shield className="h-6 w-6 text-teal-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{phone}</span>{" "}
                            raqamiga tasdiqlash kodi yuborildi
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Tasdiqlash kodini kiriting"
                          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-3 text-sm placeholder-gray-500 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          disabled={loading}
                          maxLength={6}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading || (!code && !responseCode)}
                        className="group relative w-full overflow-hidden rounded-lg bg-teal-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="relative flex items-center justify-center">
                          {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              Tasdiqlash
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </span>
                      </button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="text-center">
                        {countdown > 0 ? (
                          <p className="text-sm text-gray-500">
                            Qayta yuborish: {formatTime(countdown)}
                          </p>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="text-sm text-teal-500 hover:text-teal-600 hover:underline focus:outline-none disabled:opacity-50"
                          >
                            Kodni qayta yuborish
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Register Step */}
                {step === "register" && (
                  <>
                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Foydalanuvchi nomi"
                          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-3 text-sm placeholder-gray-500 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={regionId}
                          onChange={handleRegionChange}
                          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-8 py-3 text-sm text-gray-700 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                          disabled={loading}
                        >
                          <option value="">Viloyatni tanlang</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={districtId}
                          onChange={(e) => setDistrictId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-8 py-3 text-sm text-gray-700 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                          disabled={loading || !regionId}
                        >
                          <option value="">Tumanni tanlang</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <button
                        onClick={handleCreateAccount}
                        disabled={
                          loading || !username || !regionId || !districtId
                        }
                        className="group relative w-full overflow-hidden rounded-lg bg-teal-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="relative flex items-center justify-center">
                          {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              Hisobni yaratish
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </span>
                      </button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
