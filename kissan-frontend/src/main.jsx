import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
     <LanguageProvider>
      <AuthProvider>
       <ErrorBoundary>
        <App />
       </ErrorBoundary> 
      </AuthProvider>
     </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);