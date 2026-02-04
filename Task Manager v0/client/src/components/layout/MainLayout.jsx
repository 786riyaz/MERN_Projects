import Navbar from "../common/Navbar";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ padding: "16px" }}>
        {children}
      </main>
    </>
  );
};

export default MainLayout;
