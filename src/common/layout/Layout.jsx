import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { get } from "lodash";
import { Heart, HomeIcon, Menu, PlusCircleIcon, User } from "lucide-react";

import Container from "../components/Container";
import Header from "../components/Header";
import HeaderCatalog from "../components/HeaderCatalog";

import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";

import Footer from "../components/Footer";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useGetUser();
  const { isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);

  const hideForPaths = ["/add-item", "/auth", "/detail"]; 
  const hideForPathsMobile = ["/add-item", "/auth", "/detail"]; 

  const hideHeader = hideForPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  const hideFooter = hideForPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  const showMobileNav = !hideHeader;

  const handleFavoriteClick = useCallback(() => {
    localStorage.setItem("liked", JSON.stringify("liked"));
    navigate(isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login", {
      state: { from: location.pathname, target: "favorites" },
    });
  }, [isAuthenticated, navigate, user, location]);

  return (
    <div className="flex flex-col min-h-screen">
      {(!hideHeader || (window.innerWidth >= 450 && hideForPathsMobile)) && (
        <Header />
      )}

      <main className="flex-grow ">
        <div
          className="min-h-screen flex-grow-0 "
          style={{ paddingBottom: showMobileNav ? "80px" : "0" }}
        >
          <Container>
            <Outlet />
          </Container>
        </div>
        <HeaderCatalog isOpen={isOpen} setIsOpen={setIsOpen} />
      </main>

      {showMobileNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 safe-area-bottom">
          <div className="flex justify-around items-center h-16 px-1">
            <Link
              to="/"
              className="group flex flex-col items-center justify-center min-w-[60px]"
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <HomeIcon
                  size={22}
                  className="text-purple-600 group-hover:text-purple-700"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 group-hover:text-purple-600 mt-1">
                Asosiy
              </span>
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="group flex flex-col items-center justify-center min-w-[60px]"
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Menu
                  size={22}
                  className="text-purple-600 group-hover:text-purple-700"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 group-hover:text-purple-600 mt-1">
                Katalog
              </span>
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

            <button
              onClick={handleFavoriteClick}
              className="group flex flex-col items-center min-w-[60px]"
              aria-label="Sevimlilar"
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Heart
                  className="text-purple-600 group-hover:text-purple-700"
                  size={20}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 group-hover:text-purple-600 mt-1">
                Sevimlilar
              </span>
            </button>

            <Link
              to={isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login"}
              className="group flex flex-col items-center justify-center min-w-[60px]"
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <User
                  size={22}
                  className="text-purple-600 group-hover:text-purple-700"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 group-hover:text-purple-600 mt-1">
                Profil
              </span>
            </Link>
          </div>
        </nav>
      )}

      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
