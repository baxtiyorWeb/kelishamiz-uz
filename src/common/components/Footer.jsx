import { Link } from "react-router-dom";
import { FaGooglePlay, FaAppStoreIos } from "react-icons/fa";
import useAuthStore from "../../store";
import { get } from "lodash";
import useGetUser from "../../hooks/services/useGetUser";
const Footer = () => {
    const user = useGetUser();
  const { isAuthenticated } = useAuthStore();
  const socialLinks = [
    { icon: FaGooglePlay, label: "Google Play", href: "#" },
    { icon: FaAppStoreIos, label: "App Store", href: "#" },
  ];

  const mainLinks = [
    { label: "Asosiy", href: "/" },
    { label: "Biz haqimizda", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  const profileLinks = [
    { label: "Login", href: "/auth/login" },
    {
      label: "Profil",
      href: `${isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login"}`,
    },
    { label: "A'loqa uchun", href: "/contact" },
  ];

  const Column = ({ title, links }) => (
    <div className="space-y-3">
      <h4 className="text-gray-900 font-bold text-base lg:text-lg whitespace-nowrap">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-gray-600 hover:text-purple-600 transition-colors text-sm lg:text-base"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-white border-t mb-20 border-gray-100 mt-12 py-8 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* 1. LOGO & Description */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link
              to="/"
              className="text-3xl font-extrabold tracking-tight text-gray-900"
            >
              <img
                className="h-9 w-[120px] object-cover"
                src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
                alt=""
              />
            </Link>
            <p className="text-gray-500 text-sm lg:text-base pr-4">
              Kelishamiz.uz sayti orqali yanada oson toping va qulayliklarga ega
              bo'ling
            </p>
          </div>

          {/* 2. Asosiy Havolalar */}
          <Column title="Asosiy" links={mainLinks} />

          {/* 3. Profil / Login Havolalar */}
          <Column title="Login" links={profileLinks} />

          {/* 4. Ijtimoiy tarmoqlar */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-gray-900 font-bold text-base lg:text-lg whitespace-nowrap">
              Ijtimoiy tarmoqlar
            </h4>
            <div className="flex space-x-3">
              {socialLinks.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all shadow-sm bg-white"
                  aria-label={item.label}
                >
                  <item.icon />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
