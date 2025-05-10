const Container = ({ children }) => {
  return (
    <div className="container mx-auto px-0 sm:px-1 md:px-2 lg:px-8">
      {children}
    </div>
  );
};

export default Container;
