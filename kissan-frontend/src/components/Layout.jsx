import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">
              {/* Page title could go here dynamically */}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500">🇵🇰 Pakistan</span>
              <button className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center">
                🔔
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}