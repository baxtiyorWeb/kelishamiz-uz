/* eslint-disable react/prop-types */
export const ButtonUI = ({ children }) => {
  return (
    <button className="flex justify-center font-poppins bg-btnColor text-white  items-center space-x-2  px-5 py-[5px] rounded-md">
      {children}
    </button>
  );
};
