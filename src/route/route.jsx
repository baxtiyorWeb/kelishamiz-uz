import { Route, Routes } from "react-router-dom";
import HomeContainer from "../common/containers/HomeContainer";
import ProductPages from "../modules/product/pages/ProductPages";
import Layout from "../common/layout/Layout";
import AuthLayout from "../common/layout/authLayout";
import Login from "../modules/auth/pages/Login";
import { PrivateRoute } from "./PrivateRoute.jsx";

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomeContainer />} />
        <Route path="detail/:id" element={<ProductPages />} />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
      </Route>
    </Routes>
  );
};
