import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Layout from "../components/Layout";
import PageTransition from "../components/PageTransition";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ProfileCreatePage from "../pages/ProfileCreatePage";
import Dashboard from "../pages/Dashboard";
import InputCatalogPage from "../pages/InputCatalogPage";
import InputOrdersPage from "../pages/InputOrdersPage";
import AdvancesPage from "../pages/AdvancesPage";
import ContractsPage from "../pages/ContractsPage";
import ListingsPage from "../pages/ListingsPage";
import MyListingsPage from "../pages/MyListingsPage";
import ConsumerOrdersPage from "../pages/ConsumerOrdersPage";
import RecordPage from "../pages/RecordPage";
import RatingsPage from "../pages/RatingsPage";
import AdminDocsPage from "../pages/AdminDocsPage";
import VerificationUploadPage from "../pages/VerificationUploadPage";
import LandingPage from "../pages/LandingPage";
import ProfilePage from "../pages/ProfilePage";

export default function AppRouter() {
  const location = useLocation();

    return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<LandingPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/create" element={<ProfileCreatePage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/input-orders" element={
          <RoleRoute allowedRoles={["farmer", "shopkeeper"]}><InputOrdersPage /></RoleRoute>
        } />
        <Route path="/input-catalog" element={
          <RoleRoute allowedRoles={["shopkeeper"]}><InputCatalogPage /></RoleRoute>
        } />

        <Route path="/advances" element={
          <RoleRoute allowedRoles={["farmer"]}><AdvancesPage /></RoleRoute>
        } />
        <Route path="/advances/manage" element={
          <RoleRoute allowedRoles={["broker"]}><AdvancesPage manage /></RoleRoute>
        } />

        <Route path="/contracts" element={
          <RoleRoute allowedRoles={["farmer"]}><ContractsPage /></RoleRoute>
        } />
        <Route path="/contracts/manage" element={
          <RoleRoute allowedRoles={["factory"]}><ContractsPage manage /></RoleRoute>
        } />

        <Route path="/listings" element={
          <RoleRoute allowedRoles={["broker", "factory", "consumer"]}><ListingsPage /></RoleRoute>
        } />
        <Route path="/my-listings" element={
          <RoleRoute allowedRoles={["farmer", "broker"]}><MyListingsPage /></RoleRoute>
        } />

        <Route path="/consumer-orders" element={
          <RoleRoute allowedRoles={["consumer"]}><ConsumerOrdersPage /></RoleRoute>
        } />

        <Route path="/ledger" element={
          <RoleRoute allowedRoles={["farmer"]}><RecordPage /></RoleRoute>
        } />

        <Route path="/ratings/:userId" element={<RatingsPage />} />

        <Route path="/verification" element={
          <RoleRoute allowedRoles={["farmer", "shopkeeper", "broker", "factory"]}>
            <VerificationUploadPage />
          </RoleRoute>
        } />

        <Route path="/admin/verification" element={
          <RoleRoute allowedRoles={["admin"]}><AdminDocsPage /></RoleRoute>
        } />
      </Route>
    </Routes>
  );
}