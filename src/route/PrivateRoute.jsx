import useAuthStore from "../store";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  return <>{isAuthenticated && children}</>;
};

export default PrivateRoute;
