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
import VerifyGoogleAuth from "./pages/VerifyGoogleAuth";
import RequestAccessKey from "./pages/RequestAccessKey";
import ModifyProfile from "./pages/ModifyProfile";
import PasswordChange from "./pages/PasswordChange";
import Confidentiality from "./pages/Confidentiality";
import BeginCompanyStock from "./pages/BeginCompanyStock";
import CreateCompany from "./pages/CreateCompany";
import CompanyValidation from "./pages/CompanyValidation";
import EtatFinanceForm from "./pages/EtatFinanceForm";
import ListComponey from "./pages/ListComponey";
import CompanyApplication from "./pages/admin/CompanyApplication";

// 🆕 IMPORT DES NOUVELLES PAGES
import ViewWallet from "./pages/ViewWallet";
import ViewCards from "./pages/ViewCards";
import StockDetails from "./pages/StockDetails";
import StockDetailsMarket from "./pages/Market";

// 🔑 IMPORTS POUR LE DASHBOARD ADMINISTRATEUR
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout"; 
import ViewTransactions from "./pages/ViewTransactions";
import StatisticsPage from "./pages/StatisticsPage";
import StockListMarket from "./pages/Market";
import StockWallet from "./pages/StockWallet";
import ChatSupport from "./pages/ChatSupport";
import BestSales from "./pages/BestSales";
import Notifications from "./pages/Notification";
import AnalysisPage from "./pages/Analysis";
import CheckTechniqueByAIPage from "./pages/CheckTechniqueByAIPage";
import AdminVerifyUser from "./pages/admin/AdminVerifyUser";
import Markett from "./pages/admin/Market";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllCompaniesPage from "./pages/admin/AllCompaniesPage";
import AllUsersPage from "./pages/admin/AllUsersPage";
import AdminEmailSender from "./pages/admin/AdminEmailSender";
import SystemSettingsPage from "./pages/SystemSettingsPage";



// 🚨 PLACEHOLDERS TEMPORAIRES (à remplacer lorsque vous créez les pages ci-dessus)
const AdminOverview = () => <div className="p-6 text-xl">Bienvenue sur le Tableau de Bord Admin (A faire)</div>;
const AdminUserManagement = () => <div className="p-6 text-xl">Gestion des Utilisateurs (A faire)</div>;
const AdminCompanyValidation = () => <div className="p-6 text-xl">Validation des Sociétés (A faire)</div>;
const AdminFinanceReports = () => <div className="p-6 text-xl">Rapports Financiers (A faire)</div>;
// -------------------------------------------------------------------------------------------------

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Sign_up" element={<Sign_up />} />
          
          {/* ------------------------------------------------------------- */}
          {/* 👤 ROUTES UTILISATEUR STANDARD (DashboardLayout)                 */}
          {/* ------------------------------------------------------------- */}
          <Route path="/dashboard" element={<DashboardLayout />}> 
             <Route index element={<StockList />} />
             <Route path="profile" element={<Profile />} />
             <Route path="Editprofile" element={<ModifyProfile />} />
             <Route path="PasswordChange" element={<PasswordChange />} />
             <Route path="Confidentiality" element={<Confidentiality />} />
             <Route path="stocklist" element={<StockList />} />
             <Route path="verify" element={<Verify />} />
             <Route path="verifyemail" element={<VerifyEmail />} />
             <Route path="VerifyIdentity" element={<VerifyIdentity />} />
             <Route path="VerifyGoogleAuth" element={<VerifyGoogleAuth />} />
             <Route path="RequestAccessKey" element={<RequestAccessKey />} />
             <Route path="BeginCompanyStock" element={<BeginCompanyStock />} />
             <Route path="CreateCompany" element={<CreateCompany />} />
             <Route path="CompanyValidation" element={<CompanyValidation />} />
             <Route path="EtatFinanceForm" element={<EtatFinanceForm />} />
             <Route path="ListComponey" element={<ListComponey />} />
             <Route path="stock-details" element={<StockDetails />} />
             <Route path="Transactions" element={<ViewTransactions />} />
             <Route path="statistique" element={<StatisticsPage />} />
             <Route path="StockWallet" element={<StockWallet />} />
            <Route path="support" element={<ChatSupport />} />
             <Route path="market" element={<StockListMarket />} />
             <Route path="wallet" element={<ViewWallet />} />
             <Route path="cards" element={<ViewCards />} />
             <Route path="BestSales" element={<BestSales />} />
             <Route path="notification" element={<Notifications />} />
             <Route path="AnalysisPage" element={<AnalysisPage />} />
             <Route path="CheckTechniqueByAIPage" element={<CheckTechniqueByAIPage />} />

          </Route>
          
          {/* ------------------------------------------------------------- */}
          {/* 👑 ROUTES ADMINISTRATEUR (AdminDashboardLayout)                 */}
          {/* ------------------------------------------------------------- */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
             <Route index element={<AdminDashboard />} /> {/* /admin/ */}
             <Route path="Market" element={<Markett />} />
             <Route path="AdminVerifyUser" element={<AdminVerifyUser />} />
             <Route path="AdminCompony" element={<CompanyApplication />} />
             <Route path="company-application" element={<AllCompaniesPage />} />
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="AllUsersPage" element={<AllUsersPage />} />
             <Route path="settings" element={<SystemSettingsPage />} />
             <Route path="AdminEmailSender" element={<AdminEmailSender />} />
          </Route>

          {/* ------------------------------------------------------------- */}
          {/* 🛑 ROUTE PAR DÉFAUT (404)                                        */}
          {/* ------------------------------------------------------------- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;