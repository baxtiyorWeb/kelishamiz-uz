const Container = ({ children }) => {
  return (
    <div className="max-w-[95dvw] container lg:px-5 sm:px-2 md:px-2 mx-auto">
      {children}
    </div>
  );
};

export default Container;
