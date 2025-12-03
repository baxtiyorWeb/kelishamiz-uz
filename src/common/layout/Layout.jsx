import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { get } from "lodash";
import { Heart, HomeIcon, Menu, PlusCircleIcon, User } from "lucide-react";

// 🚨 Loyihangiz yo'liga qarab importlarni to'g'rilang
import Container from "../components/Container";
import Header from "../components/Header";
import HeaderCatalog from "../components/HeaderCatalog"; // Sizning katalog modalingiz

// 🚨 Hookslar va Storni import qiling
import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";

import Footer from "../components/Footer";

const Layout = () => {
  const location = useLocation();
  const user = useGetUser();
  const { isAuthenticated } = useAuthStore();

  // Katalog uchun modal/state
  const [isOpen, setIsOpen] = useState(false);

  // === Header/Footer'ni yashirish mantiqi (Sizning talabingiz bo'yicha) ===
  const hideForPaths = ["/add-item", "/auth", "/detail"]; // /auth/login va /auth/register kabi yo'llarni yashirish uchun /auth qo'shildi
  const hideForPathsMobile = ["/add-item", "/auth", "/detail"]; // /auth/login va /auth/register kabi yo'llarni yashirish uchun /auth qo'shildi

  const hideHeader = hideForPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  // Footer'ni faqat /add-item va /auth da yashiramiz
  const hideFooter = hideForPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  // Mobil navigatsiyani faqat yashirilishi kerak bo'lmagan joylarda ko'rsatamiz
  const showMobileNav = !hideHeader;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HEADER (faqa /add-item va /auth da yashirinadi) */}
      {!hideHeader || window.innerWidth >= 450 && hideForPathsMobile && <Header />}

      {/* 2. ASOSIY KONTENT */}
      <main className="flex-grow ">
        <Container>
          <div
            className="min-h-[70vh] flex-grow-0 "
            style={{ paddingBottom: showMobileNav ? "80px" : "0" }}
          >
            <Outlet />
          </div>

          <HeaderCatalog isOpen={isOpen} setisOpen={setIsOpen} />
        </Container>
      </main>

      {showMobileNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 safe-area-bottom">
          <div className="flex justify-around items-center h-16 px-1">
            <Link
              to="/"
              className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-500 active:scale-95 transition-all px-2 py-1 min-w-[60px]"
            >
              <HomeIcon size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">Asosiy</span>
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-500 active:scale-95 transition-all px-2 py-1 min-w-[60px]"
            >
              <Menu size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">Katalog</span>
            </button>
            <Link
              to={!isAuthenticated ? "/auth/login" : "/add-item"}
              className="flex flex-col items-center justify-center -mt-6 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-lg active:scale-95 transition-all"
            >
              <PlusCircleIcon size={28} className="text-white" />
              <span className="text-[9px] font-medium text-white mt-0.5">
                Qo'shish
              </span>
            </Link>

            <Link
              to="/profile/dashboard/favourites"
              className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-500 active:scale-95 transition-all px-2 py-1 min-w-[60px]"
            >
              <Heart size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">Sevimli</span>
            </Link>

            <Link
              to={isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login"}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-500 active:scale-95 transition-all px-2 py-1 min-w-[60px]"
            >
              <User size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">Profil</span>
            </Link>
          </div>
        </nav>
      )}

      {!hideFooter && <Footer  />}
    </div>
  );
};

export default Layout;
