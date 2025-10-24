import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Sign_up from "./pages/Sign_up";
import Profile from "./pages/Profile"
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/DashboardLayout"; 
import StockList from './pages/StockList'; 
import Verify from "./pages/Verify";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyIdentity from "./pages/VerifyIdentity";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Sign_up" element={<Sign_up />} />
          <Route path="/dashboard" element={<DashboardLayout />}> 
                <Route index element={<StockList />} />
                <Route path="profile" element={<Profile />} />
                <Route path="stocklist" element={<StockList />} />
                <Route path="verify" element={<Verify />} />
                <Route path="verifyemail" element={<VerifyEmail />} />
                <Route path="VerifyIdentity" element={<VerifyIdentity />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;