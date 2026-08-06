import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppRouter from "./routes/AppRouter";

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <AppRouter />
    </AnimatePresence>
  );
}