import { Outlet, useLocation } from "react-router-dom";
import Container from "../components/Container";
import Header from "../components/Header";

const Layout = () => {
  const location = useLocation();

  const hideHeader = location.pathname === "/add-item";

  return (
    <div>
      {!hideHeader && <Header />}
      <Container>
        <div className="min-h-auto flex-grow-0 pb-20">
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default Layout;
