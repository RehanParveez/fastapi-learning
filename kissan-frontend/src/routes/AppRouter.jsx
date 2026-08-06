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

export default function AppRouter() {
  const location = useLocation();

   return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/profile/create" element={<PageTransition><ProfileCreatePage /></PageTransition>} />

        <Route path="/input-orders" element={
          <RoleRoute allowedRoles={["farmer", "shopkeeper"]}>
            <PageTransition><InputOrdersPage /></PageTransition>
          </RoleRoute>
        } />
        <Route path="/advances" element={
          <RoleRoute allowedRoles={["farmer"]}>
            <PageTransition><AdvancesPage /></PageTransition>
          </RoleRoute>
        } />
        <Route path="/contracts" element={
          <RoleRoute allowedRoles={["farmer"]}>
            <PageTransition><ContractsPage /></PageTransition>
          </RoleRoute>
        } />
        <Route path="/my-listings" element={
          <RoleRoute allowedRoles={["farmer", "broker"]}>
            <PageTransition><MyListingsPage /></PageTransition>
          </RoleRoute>
        } />
        <Route path="/ledger" element={
          <RoleRoute allowedRoles={["farmer"]}>
            <PageTransition><RecordPage /></PageTransition>
          </RoleRoute>
        } />

        <Route path="/input-catalog" element={
          <RoleRoute allowedRoles={["shopkeeper"]}>
            <PageTransition><InputCatalogPage /></PageTransition>
          </RoleRoute>
        } />

        <Route path="/advances/manage" element={
          <RoleRoute allowedRoles={["broker"]}>
            <PageTransition><AdvancesPage manage /></PageTransition>
          </RoleRoute>
        } />
        <Route path="/listings" element={
          <RoleRoute allowedRoles={["broker", "factory", "consumer"]}>
            <PageTransition><ListingsPage /></PageTransition>
          </RoleRoute>
        } />

        <Route path="/contracts/manage" element={
          <RoleRoute allowedRoles={["factory"]}>
            <PageTransition><ContractsPage manage /></PageTransition>
          </RoleRoute>
        } />

        <Route path="/consumer-orders" element={
          <RoleRoute allowedRoles={["consumer"]}>
            <PageTransition><ConsumerOrdersPage /></PageTransition>
          </RoleRoute>
        } />

        <Route path="/ratings/:userId" element={<PageTransition><RatingsPage /></PageTransition>} />

        <Route path="/admin/verification" element={
          <RoleRoute allowedRoles={["admin"]}>
            <PageTransition><AdminDocsPage /></PageTransition>
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
}