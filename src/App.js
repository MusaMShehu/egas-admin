// // src/App.js
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
// import { SnackbarProvider } from "./contexts/SnackbarContext";
// import AdminLayout from "./components/Admin/AdminLayout";
// import AdminDashboard from "./components/Admin/AdminDashboard";
// import UserManagement from "./components/Admin/UserManagement/UserManagement";
// import OrderManagement from "./components/Admin/OrderManagement/OrderManagement";
// import AdminProductManagement from "./components/Admin/ProductManagement/AdminProductManagement";
// import SubscriptionManagement from "./components/Admin/SubscriptionManagement/SubscriptionManagement";
// import DeliveryManagement from "./components/Admin/DeliveryManagement/DeliveryManagement";
// import DeliveryAgentPortal from "./components/Admin/DeliveryManagement/DeliveryAgentPortal";
// import CustomerDeliveryHistory from "./components/Admin/DeliveryManagement/CustomerDeliveryHistoryConfirmation";
// import SupportManagement from "./components/Admin/SupportManagement/SupportManagement";
// import AdminReports from "./components/Admin/Reports/AdminReports";
// import AdminPanelSettings from "./components/Admin/Settings/AdminPanelSettings";
// import Login from "./AuthForm/login";
// import PrivateRoute from "./AuthForm/PrivateRoute";
// import "./App.css";
// import AuthPage from "./AuthForm/authPage";

// function App() {
//   return (
//     <AuthProvider>
//       <SnackbarProvider>
//         {/* <Router> */}
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/login" element={<AuthPage />} />

//             {/* Admin Routes */}
//             <Route path="/admin" element={
//               <PrivateRoute allowedRoles={["admin", "super-admin"]}>
//                 <AdminLayout />
//               </PrivateRoute>
//             }>
//               <Route index element={<Navigate to="/admin/overview" replace />} />
//               <Route path="overview" element={<AdminDashboard />} />
//               <Route path="users" element={<UserManagement />} />
//               <Route path="orders" element={<OrderManagement />} />
//               <Route path="products" element={<AdminProductManagement />} />
//               <Route path="subscriptions" element={<SubscriptionManagement />} />
//               <Route path="deliveries" element={<DeliveryManagement />} />
//               <Route path="support" element={<SupportManagement />} />
//               <Route path="reports" element={<AdminReports />} />
//               <Route path="settings" element={<AdminPanelSettings />} />
//             </Route>

//             {/* Delivery Agent Routes */}
//             <Route path="/delivery" element={
//               <PrivateRoute allowedRoles={["delivery"]}>
//                 <AdminLayout />
//               </PrivateRoute>
//             }>
//               <Route index element={<Navigate to="/delivery/dashboard" replace />} />
//               <Route path="dashboard" element={<DeliveryAgentPortal />} />
//             </Route>

//             {/* Customer Routes */}
//             <Route path="/customer" element={
//               <PrivateRoute allowedRoles={["user", "customer"]}>
//                 <div className="customer-layout">
//                   {/* Customer layout components */}
//                 </div>
//               </PrivateRoute>
//             }>
//               <Route path="deliveries" element={<CustomerDeliveryHistory />} />
//             </Route>

//             {/* Fallback */}
//             {/* <Route path="*" element={<Navigate to="/admin" replace />} /> */}
//           </Routes>
//         {/* </Router> */}
//       </SnackbarProvider>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { LiveProvider } from "./contexts/LiveContext";

import ProtectedRoute, {
  HomeRedirect,
} from "./components/layout/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import DeliveryLayout from "./components/layout/DeliveryLayout";

// Admin pages
// Admin pages
import AdminOverview from "./pages/overview/AdminOverview";
import AdminUsers from "./pages/users/AdminUsers";
import AdminSubscriptions from "./pages/subscriptions/AdminSubscriptions";
import AdminDeliveries from "./pages/deliveries/AdminDeliveries";
import AdminRefills from "./pages/refills/AdminRefills";
import AdminCylinders from "./pages/cylinders/AdminCylinders";
import AdminRemnantLedger from "./pages/remnant/AdminRemnantLedger";
import AdminDisputes from "./pages/disputes/AdminDisputes";
import AdminSettlements from "./pages/settlements/AdminSettlements";
import AdminPlants from "./pages/plants/AdminPlants";
import AdminPlans from "./pages/plans/AdminPlans";
import AdminSupport from "./pages/support/AdminSupport";
import AdminReports from "./pages/reports/AdminReports";
import AdminSettings from "./pages/settings/AdminSettings";
import AdminConfig from "./pages/config/AdminConfig";

// Delivery Agent pages
import DeliveryDashboard from "./pages/delivery/DeliveryAgentPortal";
import RefillRequests from "./components/delivery/RefillRequests";
import RemnantPanel from "./components/delivery/RemnantPanel";

// Auth pages
import AuthPage from "./AuthForm/authPage";
import ForgotPassword from "./AuthForm/forgotPassword";
import Unauthorized from "./pages/Unauthorized";
import PlaceholderPage from "./pages/PlaceholderPage";

import "./styles/index.css";

const App = () => {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <LiveProvider>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Home redirect by role */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<HomeRedirect />} />

            {/* ─── Admin portal ─── */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "super-admin", "customer_care"]}
                />
              }
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/overview" replace />}
                />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="deliveries" element={<AdminDeliveries />} />
                <Route path="refills" element={<AdminRefills />} />
                <Route path="cylinders" element={<AdminCylinders />} />
                <Route path="remnant-ledger" element={<AdminRemnantLedger />} />
                <Route path="disputes" element={<AdminDisputes />} />
                <Route path="settlements" element={<AdminSettlements />} />
                <Route path="plants" element={<AdminPlants />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="config" element={<AdminConfig />} />
              </Route>
            </Route>

            {/* ─── Delivery agent portal ─── */}
            <Route
              path="/delivery"
              element={<ProtectedRoute allowedRoles={["delivery"]} />}
            >
              <Route element={<DeliveryLayout />}>
                <Route
                  index
                  element={<Navigate to="/delivery/dashboard" replace />}
                />
                <Route path="dashboard" element={<DeliveryDashboard />} />
                <Route path="refills" element={<RefillRequests />} />
                <Route path="remnant" element={<RemnantPanel />} />
                <Route
                  path="notifications"
                  element={<PlaceholderPage title="Notifications" />}
                />
              </Route>
            </Route>

            {/* ─── Plant portal (out of scope — redirect if entered) ─── */}
            <Route
              path="/plant/*"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "plant_admin",
                    "plant_supervisor",
                    "plant_operator",
                    "plant_staff",
                  ]}
                />
              }
            >
              <Route
                path="*"
                element={<PlaceholderPage title="Plant Portal (external)" />}
              />
            </Route>

            {/* ─── Customer portal (minimal) ─── */}
            <Route
              path="/customer/*"
              element={<ProtectedRoute allowedRoles={["user"]} />}
            >
              <Route
                path="*"
                element={<PlaceholderPage title="Customer Portal" />}
              />
            </Route>

            {/* Legacy auth fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LiveProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
