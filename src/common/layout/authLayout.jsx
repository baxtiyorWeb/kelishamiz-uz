import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex h-[100vh] w-full  flex-col items-center justify-center">
      <div className="flex  w-full items-center justify-center  shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;
