import { FC, useEffect } from "react";

const Logout: FC = () => {
  useEffect(() => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }, []);
  return null;
};

export default Logout;
