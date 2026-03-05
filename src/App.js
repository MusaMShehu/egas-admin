import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

// authentication
// import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPage from "./AuthForm/authPage";
import ForgotPassword from './AuthForm/forgotPassword';


// Admin Panel
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserManagement from "./components/Admin/UserManagement/UserManagement";
import OrderManagement from "./components/Admin/OrderManagement/OrderManagement";
import ProductManagement from "./components/Admin/ProductManagement/AdminProductManagement";
import SubscriptionManagement from "./components/Admin/SubscriptionManagement/SubscriptionManagement";
import AdminDeliveryManagement from "./components/Admin/DeliveryManagement/DeliveryManagement";
import SupportManagement from "./components/Admin/SupportManagement/SupportManagement";
import AdminReport from "./components/Admin/Reports/AdminReports";
import AdminPanelSettings from "./components/Admin/Settings/AdminPanelSettings";
import DeliveryAgentPortal from "./components/Admin/DeliveryManagement/DeliveryAgentPortal";




function App() {

  return (

    <AuthProvider>
        <SnackbarProvider>
      <div className="App">
        <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        pauseOnHover
        closeOnClick />
        <Routes>

          <Route path="/" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/* Admin Routes (can also be wrapped with ProtectedRoute if only admins allowed) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="deliveries" element={<AdminDeliveryManagement />} />
            <Route path="delivery-agent" element={<DeliveryAgentPortal />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="reports" element={<AdminReport />} />
            <Route path="settings" element={<AdminPanelSettings />} />
          </Route>
          
        </Routes>
      </div>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
