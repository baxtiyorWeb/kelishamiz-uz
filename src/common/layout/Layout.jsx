import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Container from "../components/Container";
import Header from "../components/Header";
import { Heart, HomeIcon, Menu, PlusCircleIcon, User } from "lucide-react";
import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";
import { get } from "lodash";
import HeaderCatalog from "../components/HeaderCatalog";

const Layout = () => {
  const location = useLocation();
  const user = useGetUser();
  const { isAuthenticated } = useAuthStore();

  // agar /add-item va /user (yoki ularning nested route'lari) da headerni yashirmoqchi bo'lsangiz:
  const hideForPaths = ["/add-item", "/user","/detail"];
  // nested route'lar ham hisobga olinsin:
  const hideHeader = hideForPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  // katalog uchun modal/state (avval siz setIsOpen ga chaqirgansiz lekin aniqlamagan edingiz)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Headerni faqat hideHeader false bo'lganda ko'rsatamiz */}
      {!hideHeader && <Header />}

      <Container>
        <div className="min-h-auto flex-grow-0 pb-20">
          <Outlet />
        </div>

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
              className="flex flex-col items-center justify-center -mt-6 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-400  rounded-full shadow-lg active:scale-95 transition-all"
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
        {isOpen && <HeaderCatalog isOpen={isOpen} setisOpen={setIsOpen} />}
      </Container>
    </div>
  );
};

export default Layout;
