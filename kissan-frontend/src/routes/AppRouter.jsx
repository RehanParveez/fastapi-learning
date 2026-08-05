import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfileCreatePage from "../pages/ProfileCreatePage";
import Dashboard from "../pages/Dashboard";
import InputCatalogPage from "../pages/InputCatalogPage";
import InputOrdersPage from "../pages/InputOrdersPage";
import AdvancesPage from "../pages/AdvancesPage";
import ContractsPage from "../pages/ContractsPage";
import ListingsPage from "../pages/ListingsPage";
import MyListingsPage from "../pages/MyListingsPage";
import ConsumerOrdersPage from "../pages/ConsumerOrdersPage";
import LedgerPage from "../pages/RecordPage";
import RatingsPage from "../pages/RatingsPage";
import AdminDocsPage from "../pages/AdminDocsPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile/create" element={<ProfileCreatePage />} />

        <Route path="/input-orders" element={
          <RoleRoute allowedRoles={["farmer"]}><InputOrdersPage /></RoleRoute>
        } />
        <Route path="/advances" element={
          <RoleRoute allowedRoles={["farmer"]}><AdvancesPage /></RoleRoute>
        } />
        <Route path="/contracts" element={
          <RoleRoute allowedRoles={["farmer"]}><ContractsPage /></RoleRoute>
        } />
        <Route path="/my-listings" element={
          <RoleRoute allowedRoles={["farmer", "broker"]}><MyListingsPage /></RoleRoute>
        } />
        <Route path="/ledger" element={
          <RoleRoute allowedRoles={["farmer"]}><RecordPage /></RoleRoute>
        } />

        <Route path="/input-catalog" element={
          <RoleRoute allowedRoles={["shopkeeper"]}><InputCatalogPage /></RoleRoute>
        } />

        <Route path="/advances/manage" element={
          <RoleRoute allowedRoles={["broker"]}><AdvancesPage manage /></RoleRoute>
        } />

        <Route path="/contracts/manage" element={
          <RoleRoute allowedRoles={["factory"]}><ContractsPage manage /></RoleRoute>
        } />

        <Route path="/consumer-orders" element={
          <RoleRoute allowedRoles={["consumer"]}><ConsumerOrdersPage /></RoleRoute>
        } />

        <Route path="/listings" element={
          <RoleRoute allowedRoles={["broker", "factory", "consumer"]}><ListingsPage /></RoleRoute>
        } />

        <Route path="/ratings/:userId" element={<RatingsPage />} />

        <Route path="/admin/verification" element={
          <RoleRoute allowedRoles={["admin"]}><AdminDocsPage /></RoleRoute>
        } />
      </Route>
    </Routes>
  );
}