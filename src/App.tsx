import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import ManagerDashboard from "./pages/ManagerDashboard";
import ThematicProjectsList from "./pages/ThematicProjectsList";
import ThematicProjectDetail from "./pages/ThematicProjectDetail";
import InviteCodes from "./pages/InviteCodes";
import Organizations from "./pages/Organizations";
import PaymentsReports from "./pages/PaymentsReports";
import Documents from "./pages/Documents";
import ScholarProfile from "./pages/ScholarProfile";
import ScholarProfileView from "./pages/ScholarProfileView";
import Import from "./pages/Import";
import AuditTrail from "./pages/AuditTrail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrganizationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
            
            {/* Scholar Dashboard - default route */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Manager-only routes */}
            <Route path="/painel-gestor" element={
              <RoleProtectedRoute requireManagerAccess>
                <ManagerDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/importar" element={
              <RoleProtectedRoute requireManagerAccess>
                <Import />
              </RoleProtectedRoute>
            } />
            <Route path="/projetos-tematicos" element={
              <RoleProtectedRoute requireManagerAccess>
                <ThematicProjectsList />
              </RoleProtectedRoute>
            } />
            <Route path="/projetos-tematicos/:id" element={
              <RoleProtectedRoute requireManagerAccess>
                <ThematicProjectDetail />
              </RoleProtectedRoute>
            } />
            <Route path="/codigos-convite" element={
              <RoleProtectedRoute requireManagerAccess>
                <InviteCodes />
              </RoleProtectedRoute>
            } />
            <Route path="/perfil-bolsista/:userId" element={
              <RoleProtectedRoute requireManagerAccess>
                <ScholarProfileView />
              </RoleProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/trilha-auditoria" element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AuditTrail />
              </RoleProtectedRoute>
            } />
            <Route path="/organizacoes" element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <Organizations />
              </RoleProtectedRoute>
            } />
            
            {/* Scholar routes */}
            <Route path="/pagamentos-relatorios" element={
              <ProtectedRoute>
                <PaymentsReports />
              </ProtectedRoute>
            } />
            <Route path="/documentos" element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/perfil-bolsista" element={
              <ProtectedRoute>
                <ScholarProfile />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </OrganizationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
