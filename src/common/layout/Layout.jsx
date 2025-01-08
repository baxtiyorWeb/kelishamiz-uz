import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Container from "../components/Container";

const Layout = () => {
  return (
    <Container>
      <Header />
      <div className="min-h-screen flex-grow-0 p-1">
        <Outlet />
      </div>
    </Container>
  );
};

export default Layout;
