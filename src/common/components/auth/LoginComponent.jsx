"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMaskInput } from "react-imask"; // YANGI: IMaskInput
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
  LogIn,
} from "lucide-react";
import api from "../../../config/auth/api";

const PRIMARY_COLOR = "#A64AC9";
const PRIMARY_LIGHT = "#C060F5";

const LoginComponent = () => {
  const [phone, setPhone] = useState(""); // Endi faqat raqamlar (998901234567)
  const [step, setStep] = useState("phone");
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

  useEffect(() => {
    if (step === "register") fetchRegionsData();
  }, [step]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && step === "otp") {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const fetchRegionsData = async () => {
    try {
      const response = await api.get("/location/regions");
      if (response.data?.content) setRegions(response.data.content);
    } catch (err) {
      setError("Viloyatlarni yuklashda xatolik");
    }
  };

  const handleRegionChange = (e) => {
    const id = e.target.value;
    setRegionId(id);
    setDistrictId("");
    const region = regions.find((r) => r.id === parseInt(id));
    setDistricts(region?.districts || []);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSendPhone = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (phone.length !== 12) {
      setError("To'liq telefon raqamini kiriting");
      setLoading(false);
      return;
    }

    try {
      const checkRes = await api.post("/auth/check-phone", {
        phone: `+${phone}`,
      });
      setIsNewUser(!checkRes.data?.exists);

      const res = await api.post("/auth/send-otp", { phone: `+${phone}` });
      setStep("otp");
      setCountdown(120);
      setSuccess("Kod yuborildi");
      setResponseCode(res.data.code || "");

      if (res.data.code) {
        setTimeout(() => setCode(res.data.code), 1000);
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setStep("otp");
        setCountdown(120);
        setError("Bu raqam ro'yxatdan o'tgan. Kod kiriting.");
      } else {
        setError("Xatolik yuz berdi. Qayta urining.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const finalCode = responseCode || code;
    if (!finalCode || finalCode.length < 4) {
      setError("Kod noto'g'ri");
      setLoading(false);
      return;
    }

    try {
      const verifyRes = await api.post("/auth/verify-otp", {
        phone: `+${phone}`,
        code: finalCode,
      });

      if (verifyRes.data?.success) {
        if (isNewUser) {
          setStep("register");
          setSuccess("Kod tasdiqlandi");
        } else {
          const loginRes = await api.post("/auth/login/verify-otp", {
            phone: `+${phone}`,
            code: finalCode,
          });
          localStorage.setItem("accessToken", loginRes.data?.accessToken);
          localStorage.setItem("refreshToken", loginRes.data?.refreshToken);
          setSuccess("Muvaffaqiyatli!");
          setTimeout(() => (window.location.href = "/"), 1500);
        }
      } else {
        setError("Kod noto'g'ri");
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username.trim() || !regionId || !districtId) {
      setError("Barcha maydonlarni to'ldiring");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/create-account", {
        phone: `+${phone}`,
        username,
        regionId: parseInt(regionId),
        districtId: parseInt(districtId),
      });

      localStorage.setItem("accessToken", res.data?.content?.accessToken);
      localStorage.setItem("refreshToken", res.data?.content?.refreshToken);
      setSuccess("Hisob yaratildi!");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? "Raqam allaqachon ishlatilgan"
          : "Xatolik"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", { phone: `+${phone}` });
      setCountdown(120);
      setResponseCode(res.data?.code || "");
      setSuccess("Yangi kod yuborildi");
      setCode("");
    } catch (err) {
      setError("Kod yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "otp") setStep("phone");
    if (step === "register") setStep("otp");
    setError("");
    setSuccess("");
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        {...props}
        className="w-full  pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
      />
    </div>
  );

  const SelectField = ({ icon: Icon, children, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <select
        {...props}
        className="w-full pl-10 pr-8 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm appearance-none"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl flex overflow-hidden min-h-[520px]">
        {/* Chap qism */}
        <div
          className="hidden md:flex flex-col justify-between p-10 w-1/2 text-white"
          style={{
            background: `linear-gradient(to top left, ${PRIMARY_COLOR}, ${PRIMARY_LIGHT})`,
          }}
        >
          <div>
            <h1 className="text-4xl font-bold flex items-center">
              <LogIn className="mr-3" /> E-Surxondaryo
            </h1>
            <motion.h2 className="text-4xl font-extrabold mt-8 leading-tight">
              Surxondaryo bo'yicha{" "}
              <span className="block text-yellow-300">
                Soting va Sotib oling!
              </span>
            </motion.h2>
          </div>
          <p className="text-purple-100">Tez. Ishonchli. Mahalliy.</p>
        </div>

        {/* O'ng qism */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: PRIMARY_COLOR }}
              >
                {step === "phone" && "Telefon raqam"}
                {step === "otp" && "Kod tasdiqlash"}
                {step === "register" && "Ro'yxatdan o'tish"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {step === "phone" && "Raqamingizni kiriting"}
                {step === "otp" && "SMSdagi kodni kiriting"}
                {step === "register" && "Ma'lumotlarni to'ldiring"}
              </p>
            </div>
            {step !== "phone" && (
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="mb-6 flex gap-2">
            <div
              className={`h-1 flex-1 rounded-full ${
                step !== "phone" ? "bg-purple-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step === "otp" || step === "register"
                  ? "bg-purple-500"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step === "register" ? "bg-purple-500" : "bg-gray-200"
              }`}
            />
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-sm text-green-700">
              <CheckCircle className="mr-2 w-5 h-5" /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-700">
              <AlertCircle className="mr-2 w-5 h-5" /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* PHONE STEP */}
              {step === "phone" && (
                <>
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <IMaskInput
                        mask="+998 00 000 00 00"
                        value={phone}
                        onAccept={(value) => setPhone(value.replace(/\D/g, ""))}
                        placeholder="+998 __ ___ __ __"
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                        disabled={loading}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSendPhone}
                      disabled={loading || phone.length !== 12}
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Davom etish"
                      )}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </motion.div>
                </>
              )}

              {/* OTP STEP */}
              {step === "otp" && (
                <>
                  <motion.div variants={itemVariants} className="text-center">
                    <div
                      className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: PRIMARY_COLOR + "15" }}
                    >
                      <Shield
                        className="w-6 h-6"
                        style={{ color: PRIMARY_COLOR }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        +{phone.slice(0, 3)} {phone.slice(3, 5)}{" "}
                        {phone.slice(5, 8)} {phone.slice(8, 10)}{" "}
                        {phone.slice(10)}
                      </span>{" "}
                      ga kod yuborildi
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <InputField
                      icon={Lock}
                      type="text"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="______"
                      maxLength={6}
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || (!code && !responseCode)}
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full  py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Tasdiqlash"
                      )}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="text-center text-sm"
                  >
                    {countdown > 0 ? (
                      <p className="text-gray-500">
                        Qayta yuborish:{" "}
                        <span
                          style={{ color: PRIMARY_COLOR }}
                          className="font-medium"
                        >
                          {formatTime(countdown)}
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        style={{ color: PRIMARY_COLOR }}
                        className="font-medium hover:underline"
                      >
                        Kodni qayta yuborish
                      </button>
                    )}
                  </motion.div>
                </>
              )}

              {/* REGISTER STEP */}
              {step === "register" && (
                <>
                  <motion.div variants={itemVariants}>
                    <InputField
                      icon={User}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ismingiz"
                      disabled={loading}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SelectField
                      icon={MapPin}
                      value={regionId}
                      onChange={handleRegionChange}
                      disabled={loading}
                    >
                      <option value="">Viloyat</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </SelectField>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SelectField
                      icon={MapPin}
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      disabled={loading || !regionId}
                    >
                      <option value="">Tuman/Shahar</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </SelectField>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleCreateAccount}
                      disabled={
                        loading || !username || !regionId || !districtId
                      }
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Hisob yaratish"
                      )}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
