import React from "react";
import { Sprout, RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-800">Something went wrong</h2>
            <p className="text-sm text-stone-500 mt-2 mb-6">
              The app encountered an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              <RefreshCcw size={16} /> Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}