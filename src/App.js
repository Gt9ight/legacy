import Fleetform from "./components/fleetmanager/FleetForm";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./components/home/Home";
import Customerprogress from "./components/customer/CustomerProgress";
import Login from "./components/auth/Login";
import Signup from "./components/auth/SignUp";
import FleetList from "./components/tech/FleetList";
import ProtectedRoute from "./components/auth/ProtectedRoute";
function App() {
  // const { currentUser } = useContext(AuthContext);

  // const ProtectedRoute = ({ children }) => {
  //   if (!currentUser) {
  //     return <Navigate to="/" />;
  //   }
  //   return children;
  // };


  return (
    <div >
      <BrowserRouter basename="/legacy">
      <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/fleetlist"
            element={
              <ProtectedRoute>
                <FleetList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
