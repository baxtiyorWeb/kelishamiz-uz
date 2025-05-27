import { Route, Routes } from "react-router-dom";
import HomeContainer from "../common/containers/HomeContainer";
import Layout from "../common/layout/Layout";
import AuthLayout from "../common/layout/authLayout";
import AddItem from "../modules/add-item/pages/AddItem.jsx";
import Login from "../modules/auth/pages/Login";
import CatalogPage from "../modules/catalog/pages/CatalogPage.jsx";
import ProductPages from "../modules/product/pages/ProductPages";
import UserPage from "./../modules/user/pages/UserPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import AdminPanel from "../../admin/admin-panel.jsx";
import ChatPage from "../modules/chat/chatComponent.jsx";

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
        <Route path="add-item" element={<AddItem />} />
        <Route path="user" element={<UserPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeContainer />} />
        <Route path="detail/:id" element={<ProductPages />} />
        <Route path="catalog/:id" element={<CatalogPage />} />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
      </Route>
    </Routes>
  );
};
