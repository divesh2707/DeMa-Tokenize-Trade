import React, {useEffect} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import Home from "./pages/Home";
import CreateNft from "./pages/CreateNft";
import Profile from "./pages/Profile";
import NftDetail from "./pages/NftDetail";
import NotFound from "./pages/NotFound";
import Activity from "./pages/Activity";
import Shipment from "./pages/Shipment"
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
    useEffect(() => {
        const handlePopState = () => {
          window.location.reload();
        };
    
        window.addEventListener("popstate", handlePopState);
    
        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }, []);

  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:account" element={<Profile/>} />
              <Route path="/mint" element={  <PrivateRoute> <CreateNft /> </PrivateRoute>} />
              <Route path="/:contractAddress/:tokenId" element={<NftDetail />} />
              <Route path="/*" element={<NotFound />} />
              <Route path="activity" element={<Activity />} />
              <Route path="/shipment/:shipping_id" element={<PrivateRoute> <Shipment /> </PrivateRoute>} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </Router>
    );
};

export default App;
