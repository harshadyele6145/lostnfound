import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import EditItem from "./pages/EditItem";
import FoundItem from "./pages/FoundItem";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyClaims from "./pages/MyClaims";
import MyReports from "./pages/MyReports";
import ClaimHistory from "./pages/ClaimHistory";
import LostItem from "./pages/LostItem";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import AITools from "./pages/AITools";
import VerifyQR from "./pages/VerifyQR";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./components/ToastProvider";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col dark:bg-slate-950 dark:text-slate-100">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/report-lost" element={<ProtectedRoute><LostItem /></ProtectedRoute>} />
                <Route path="/report-found" element={<ProtectedRoute><FoundItem /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
                <Route path="/verify-qr" element={<VerifyQR />} />
                <Route path="/my-claims" element={<ProtectedRoute><MyClaims /></ProtectedRoute>} />
                <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                <Route path="/claims-history" element={<ProtectedRoute><ClaimHistory /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
