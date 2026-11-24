import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import ListCar from "./pages/ListCar";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/AuthContext";

function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace/>;
  return children;
}

export default function App() {
  return <><Navbar/><main>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/cars" element={<Cars/>}/>
      <Route path="/cars/:id" element={<CarDetails/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/book/:id" element={<Protected><Booking/></Protected>}/>
      <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
      <Route path="/list-your-car" element={<Protected roles={["owner"]}><ListCar/></Protected>}/>
      <Route path="/owner" element={<Protected roles={["owner"]}><OwnerDashboard/></Protected>}/>
      <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard/></Protected>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </main><Footer/></>;
}