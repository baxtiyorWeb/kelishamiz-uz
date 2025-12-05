import { useState, useCallback } from "react";
import { Check, Zap, Star, TrendingUp, DollarSign, X } from "lucide-react";

const pricingPlans = [
  {
    name: "Oddiy (Bepul)",
    price: 0,
    duration: "Oyiga",
    isRecommended: false,
    description: "Shaxsiy ehtiyojlar uchun asosiy funksiyalar.",
    features: [
      "5 ta e'lon joylash",
      "E'lon 14 kun aktiv",
      { text: "Video qo'shish imkoniyati", hasVideo: false }, // O'zgartirildi
      "Asosiy qo'llab-quvvatlash",
      "Statistika mavjud emas",
    ],
    buttonText: "Bepul foydalanish",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
  },
  {
    name: "Kichik Start",
    price: 5000,
    duration: "Oyiga",
    isRecommended: false,
    description: "Kichik biznesni boshlash uchun optimal.",
    features: [
      "10 ta e'lon joylash",
      "E'lon 20 kun aktiv",
      { text: "1 ta video/e'lon qo'shish", hasVideo: true }, // O'zgartirildi
      "Minimal ustunlik",
      "Asosiy statistika",
    ],
    buttonText: "Obuna bo'lish",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
  },
  {
    name: "O'rta Stabil",
    price: 10000,
    duration: "Oyiga",
    isRecommended: false,
    description: "Barqaror ko'rinish va sezilarli samaradorlik.",
    features: [
      "25 ta e'lon joylash",
      "E'lon 30 kun aktiv",
      { text: "3 tagacha video/e'lon qo'shish", hasVideo: true }, // O'zgartirildi
      "Haftalik 1 marta ko'tarish",
      "Kengaytirilgan statistika",
    ],
    buttonText: "Obuna bo'lish",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
  },
  {
    name: "Premium (Tavsiya)",
    price: 30000,
    duration: "Oyiga",
    isRecommended: true,
    description: "Savdo hajmini maksimal oshirish va ko'proq mijoz topish.",
    features: [
      "Cheklanmagan e'lonlar",
      "E'lon 60 kun aktiv",
      { text: "Cheklanmagan video qo'shish", hasVideo: true }, // O'zgartirildi
      "Haftalik 5 marta ko'tarish",
      "Tezkor qo'llab-quvvatlash",
    ],
    buttonText: "Premium Obuna",
    bgColor: "bg-[#A64AC9]",
    borderColor: "border-[#A64AC9]",
    shadow: "shadow-2xl shadow-purple-300/50",
  },
  {
    name: "VIP (Elita)",
    price: 50000,
    duration: "Oyiga",
    isRecommended: false,
    description: "Eng yuqori ko'rinish va shaxsiy xizmat.",
    features: [
      "Cheklanmagan e'lonlar",
      "E'lon 90 kun aktiv",
      { text: "Cheklanmagan video qo'shish", hasVideo: true }, // O'zgartirildi
      "Kunlik avtomatik yuqoriga ko'tarish",
      "Sahifaning TOP qismida ko'rinish",
    ],
    buttonText: "Elita rejasini olish",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
  },
];

const formatPrice = (price) => {
  if (price === 0) return "Bepul";
  const numPrice = parseFloat(price);
  return `${numPrice.toLocaleString("uz-UZ", {
    maximumFractionDigits: 0,
  })} so'm`;
};

const FeatureIcon = ({ isAllowed, isRecommended }) => {
  const color = isRecommended
    ? isAllowed
      ? "text-white"
      : "text-red-300"
    : isAllowed
    ? "text-[#A64AC9]"
    : "text-red-500";

  const Icon = isAllowed ? Check : X;

  return <Icon className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${color}`} />;
};

const PricingCard = ({ plan, onSelect }) => {
  const buttonStyle = plan.isRecommended
    ? { backgroundColor: "white", color: "#A64AC9" }
    : { backgroundColor: "#A64AC9", color: "white" };

  return (
    <div
      className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${plan.bgColor} ${plan.shadow} w-full`}
      style={
        plan.isRecommended
          ? { borderColor: "#A64AC9", transform: "scale(1.03)" }
          : { borderColor: plan.borderColor }
      }
    >
      {plan.isRecommended && (
        <span className="absolute top-0 -translate-y-1/2 left-1/2 transform -translate-x-1/2 bg-[#E0AAFF] text-[#A64AC9] px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider shadow-md whitespace-nowrap">
          Eng yaxshi tanlov
        </span>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-xl font-bold ${
            plan.isRecommended ? "text-white" : "text-gray-900"
          }`}
        >
          {plan.name}
        </h3>
        {plan.isRecommended ? (
          <Zap className="w-5 h-5 text-white" />
        ) : plan.name === "VIP (Elita)" ? (
          <TrendingUp className="w-5 h-5 text-[#A64AC9]" />
        ) : (
          <Star className="w-5 h-5 text-gray-500" />
        )}
      </div>

      <p
        className={`text-xs mb-3 ${
          plan.isRecommended ? "text-purple-100" : "text-gray-600"
        }`}
      >
        {plan.description}
      </p>

      <div className="mb-4">
        <span
          className={`text-xl font-extrabold ${
            plan.isRecommended ? "text-white" : "text-gray-900"
          }`}
        >
          {formatPrice(plan.price)}
        </span>
        <span
          className={`text-lg font-medium ${
            plan.isRecommended ? "text-purple-200" : "text-gray-500"
          }`}
        >
          {plan.price !== 0 ? ` / ${plan.duration}` : ""}
        </span>
      </div>

      <div className="flex-1 space-y-2 mb-6">
        {plan.features.map((feature, index) => {
          // Funktsiya obyekt yoki oddiy satr ekanligini tekshirish
          const isObject = typeof feature === "object" && feature !== null;
          const featureText = isObject ? feature.text : feature;
          const isVideoFeature = isObject && "hasVideo" in feature;

          return (
            <div key={index} className="flex items-start">
              {isVideoFeature ? (
                <FeatureIcon
                  isAllowed={feature.hasVideo}
                  isRecommended={plan.isRecommended}
                />
              ) : (
                <Check
                  className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
                    plan.isRecommended ? "text-white" : "text-[#A64AC9]"
                  }`}
                />
              )}
              <span
                className={`text-sm ${
                  plan.isRecommended ? "text-white" : "text-gray-700"
                }`}
              >
                {featureText}
              </span>
            </div>
          );
        })}
      </div>

      <button
        className="w-full py-2 mt-auto rounded-xl font-semibold text-sm transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-purple-300 hover:opacity-90"
        style={buttonStyle}
        onClick={() => onSelect(plan.name)}
      >
        {plan.buttonText}
      </button>
    </div>
  );
};

const SubscriptionPage = () => {
  const [notification, setNotification] = useState(null);

  const handlePlanSelect = useCallback((planName) => {
    setNotification({
      message: `Siz "${planName}" rejasini tanladingiz. Keyingi bosqichga (To'lov/Aktivlash) o'tilmoqda.`,
      type: planName.includes("Bepul") ? "info" : "success",
    });

    setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {notification && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 transition-opacity duration-300 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}

        <header className="text-center mb-10 pt-4">
          <DollarSign className="w-8 h-8 text-[#A64AC9] mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sizning E'lonlar O'sish Rejangiz
          </h2>
          <p className="mt-2 text-md text-gray-600 max-w-xl mx-auto">
            Maksimal ko'rinish va savdo hajmi uchun eng mos tarifni tanlang.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4 justify-center">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} onSelect={handlePlanSelect} />
          ))}
        </div>

        <div className="mt-12 bg-white p-4 rounded-xl shadow-lg border-l-4 border-[#A64AC9] max-w-2xl mx-auto">
          <h3 className="text-md font-bold text-gray-800 flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#A64AC9]" />
            Muhim Ma'lumot
          </h3>
          <p className="mt-2 text-xs text-gray-600">
            Barcha Pullik rejalarga obuna bo'lish muddati tugagach,
            e'lonlaringiz avtomatik ravishda to'xtatiladi. Barcha narxlar
            O'zbekiston so'mida (UZS) ko'rsatilgan va qo'shimcha soliqlar
            hisobga olinmagan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
