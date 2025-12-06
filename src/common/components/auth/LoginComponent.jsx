"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMaskInput } from "react-imask";
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

const PRIMARY_COLOR = "#C060F5";
const PRIMARY_LIGHT = "#D080FF";

const OtpInputGrid = ({ length = 6, value, onChange, disabled }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value === "") {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = Array(length).fill("");

    for (let i = 0; i < length && i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);
    onChange(newOtp.join(""));

    const lastIndex = Math.min(length - 1, pasteData.length - 1);
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex].focus();
    }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          disabled={disabled}
          inputMode="numeric"
          className="w-full h-14 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all disabled:bg-gray-50"
          style={{ caretColor: PRIMARY_COLOR }}
        />
      ))}
    </div>
  );
};

const LoginComponent = () => {
  const [phone, setPhone] = useState("");
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

  const isCodeValid = code.length === 6;
  const isFormValid = useMemo(() => {
    if (step === "phone") return phone.length === 12;
    if (step === "otp") return isCodeValid;
    if (step === "register") return username.trim() && regionId && districtId;
    return false;
  }, [step, phone, isCodeValid, username, regionId, districtId]);

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
      setLoading(true);
      const response = await api.get("/location/regions");
      if (response.data?.content) setRegions(response.data.content);
    } catch (err) {
      setError("Viloyatlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhone = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (phone.length !== 12) {
      setError("To'liq telefon raqamini kiriting (12 raqam)");
      setLoading(false);
      return;
    }

    try {
      const checkRes = await api.post("/auth/check-phone", {
        phone: `+${phone}`,
      });
      setIsNewUser(!checkRes.data?.exists);

      await api.post("/auth/send-otp", { phone: `+${phone}` });

      setStep("otp");
      setCountdown(120);
      setSuccess("Kod yuborildi");
      setCode("");
    } catch (err) {
      if (err?.response?.status === 409) {
        setStep("otp");
        setCountdown(120);
        setError("Bu raqam ro'yxatdan o'tgan. Kodni kuting.");
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

    if (!isCodeValid) {
      setError("Kod noto'g'ri yoki to'liq emas (6 raqam bo'lishi kerak)");
      setLoading(false);
      return;
    }

    try {
      const verifyRes = await api.post("/auth/verify-otp", {
        phone: `+${phone}`,
        code: code,
      });

      if (verifyRes.data?.success) {
        if (isNewUser) {
          setStep("register");
          setSuccess("Kod tasdiqlandi. Ro'yxatdan o'ting.");
        } else {
          const loginRes = await api.post("/auth/login/verify-otp", {
            phone: `+${phone}`,
            code: code,
          });
          localStorage.setItem("accessToken", loginRes.data?.accessToken);
          localStorage.setItem("refreshToken", loginRes.data?.refreshToken);
          setSuccess("Muvaffaqiyatli! Tizimga kirildi.");
          setTimeout(() => (window.location.href = "/"), 1500);
        }
      } else {
        setError("Kod noto'g'ri. Qayta urinib ko'ring.");
        setCode("");
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

    if (!isFormValid) {
      setError("Barcha maydonlarni to'ldirish shart");
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

      localStorage.setItem("accessToken", res.data?.accessToken);
      localStorage.setItem("refreshToken", res.data?.refreshToken);
      setSuccess("Hisob yaratildi! Tizimga kirildi.");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      setError("Hisob yaratishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone: `+${phone}` });
      setCountdown(120);
      setSuccess("Yangi kod yuborildi");
      setCode("");
    } catch (err) {
      setError("Kod yuborishda xatolik");
    } finally {
      setLoading(false);
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

  const goBack = () => {
    if (step === "otp") {
      setStep("phone");
      setCode("");
    }
    if (step === "register") {
      setStep("otp");
    }
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
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-base placeholder:text-gray-400 transition"
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
        className="w-full pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-base appearance-none bg-white transition disabled:bg-gray-50"
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
    <div className="flex min-h-screen items-center justify-center p-0 bg-white md:bg-gray-50/50">
      <div className="w-full max-w-4xl bg-white rounded-none md:rounded-xl shadow-none md:shadow-2xl flex overflow-hidden min-h-screen md:min-h-[600px]">
        <div
          className="hidden md:flex flex-col justify-between p-10 w-1/2 text-white"
          style={{
            background: `linear-gradient(to top left, ${PRIMARY_COLOR}, ${PRIMARY_LIGHT})`,
          }}
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <LogIn className="mr-3 w-7 h-7" /> E-Surxondaryo
            </h1>
            <h2 className="text-4xl font-extrabold mt-12 leading-tight">
              Surxondaryo bo'yicha{" "}
              <span className="block text-yellow-300">
                Soting va Sotib oling!
              </span>
            </h2>
          </div>

          <div className="text-purple-100/90 text-sm">
            <p className="mb-2 font-medium">Foydalanish shartlari:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Ro'yxatdan o'tish faqat Surxondaryo viloyati fuqarolari uchun.
              </li>
              <li>SMS orqali kod yuboriladi, maxfiylik kafolatlanadi.</li>
              <li>Shaxsiy ma'lumotlaringiz xavfsiz saqlanadi.</li>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-8">
            <div className="w-full">
              <h2
                className="text-3xl font-extrabold mb-1"
                style={{ color: PRIMARY_COLOR }}
              >
                {step === "phone" && "Tizimga kirish"}
                {step === "otp" && "Kod tasdiqlash"}
                {step === "register" && "Ro'yxatdan o'tish"}
              </h2>
              <p className="text-gray-500 text-sm">
                {step === "phone" && "Telefon raqamingizni kiriting"}
                {step === "otp" && "SMSdagi 6 raqamli kodni kiriting"}
                {step === "register" && "Shaxsiy ma'lumotlaringizni to'ldiring"}
              </p>
            </div>
            {step !== "phone" && (
              <button
                onClick={goBack}
                className="p-2 ml-4 hover:bg-gray-100 rounded-full flex-shrink-0 transition"
                aria-label="Orqaga"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>

          <div className="mb-8 flex gap-2">
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                step !== "phone" ? "bg-purple-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                step === "otp" || step === "register"
                  ? "bg-purple-500"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                step === "register" ? "bg-purple-500" : "bg-gray-200"
              }`}
            />
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-300 rounded-xl flex items-center text-sm text-green-700"
            >
              <CheckCircle className="mr-2 w-5 h-5 flex-shrink-0" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-300 rounded-xl flex items-center text-sm text-red-700"
            >
              <AlertCircle className="mr-2 w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
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
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-base transition"
                        disabled={loading}
                        inputMode="tel"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSendPhone}
                      disabled={loading || !isFormValid}
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition duration-200"
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

              {step === "otp" && (
                <>
                  <motion.div variants={itemVariants} className="text-center">
                    <div
                      className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: PRIMARY_LIGHT + "30" }}
                    >
                      <Shield
                        className="w-6 h-6"
                        style={{ color: PRIMARY_COLOR }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-semibold text-gray-800">
                        +{phone.slice(0, 3)} {phone.slice(3, 5)}{" "}
                        {phone.slice(5, 8)} {phone.slice(8, 10)}{" "}
                        {phone.slice(10)}
                      </span>{" "}
                      raqamiga maxfiy kod yuborildi.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <OtpInputGrid
                      length={6}
                      value={code}
                      onChange={setCode}
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || !isFormValid}
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition duration-200"
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
                    className="text-center text-sm pt-2"
                  >
                    {countdown > 0 ? (
                      <p className="text-gray-500">
                        Qayta yuborish:{" "}
                        <span
                          style={{ color: PRIMARY_COLOR }}
                          className="font-semibold"
                        >
                          {formatTime(countdown)}
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        style={{ color: PRIMARY_COLOR }}
                        className="font-semibold hover:text-purple-600 transition disabled:opacity-50"
                      >
                        Kodni qayta yuborish
                      </button>
                    )}
                  </motion.div>
                </>
              )}

              {step === "register" && (
                <>
                  <motion.div variants={itemVariants}>
                   
                    <IMaskInput
                      mask={/^\S.*$/} // mask emas, oddiy text bosilsin
                      value={username}
                      onAccept={(value) => setUsername(value)}
                      placeholder="Ism va Familiyangiz"
                      disabled={loading}
                      className="
      w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200
      focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20
      text-base transition
    "
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SelectField
                      icon={MapPin}
                      value={regionId}
                      onChange={handleRegionChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Viloyatni tanlang
                      </option>
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
                      <option value="" disabled>
                        Tuman/Shaharni tanlang
                      </option>
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
                      disabled={loading || !isFormValid}
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition duration-200"
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

          <div className="mt-8 text-center text-xs text-gray-500 md:hidden">
            <p className="mb-1">Tizimdan foydalanish orqali siz:</p>
            <p>
              <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                Foydalanish shartlari
              </span>
              ga va{" "}
              <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                Maxfiylik siyosati
              </span>
              ga rozilik bildirasiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
