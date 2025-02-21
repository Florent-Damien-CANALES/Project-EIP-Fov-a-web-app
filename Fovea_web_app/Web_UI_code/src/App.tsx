// App.tsx
import React, { FC } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import Scan from "./pages/Scan";
import Catalogue from "./pages/Catalogue";
import Produits from "./pages/Produits";
import Login from "./pages/Login";
import Tab from "./components/Navbar";
// import Ajout from "./pages/Ajout";
import Item from "./pages/Item";
import { Toaster } from "./components/ui/toaster";
import Topbar from "./components/Topbar";
import Ajout from "./pages/Ajout";
import Logout from "./pages/Logout";

const TabWithLocation: React.FC = () => {
  const location = useLocation();

  return location.pathname !== "/login" ? <Tab /> : null;
};

const Layout: FC = () => {
  const location = useLocation();

  return (
    <div className="h-full flex flex-col">
      {location.pathname.startsWith("/catalogue") ? <Topbar /> : null}
      <div
        className={
          location.pathname == "/scan"
            ? "flex-grow h-max overflow-hidden"
            : "flex-grow h-max overflow-hidden px-10 py-10"
        }
      >
        <Outlet />
      </div>
      <Toaster />
      <TabWithLocation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/ajout" element={<Ajout />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/catalogue/:id" element={<Produits />} />
            <Route path="/" element={<Navigate to="/scan" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalogue/:id/:name" element={<Item />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
          {/* <Route path='*' element={<Navigate to='/scan' />} /> */}
        </Routes>

        {/* <TabWithLocation /> */}
      </Router>
    </div>
  );
};

export default App;
