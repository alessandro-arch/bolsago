import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ManagerGreeting } from "@/components/dashboard/ManagerGreeting";
import { ConsolidatedKPICards } from "@/components/dashboard/ConsolidatedKPICards";
import { AlertsBanner } from "@/components/dashboard/AlertsBanner";
import { BatchActionsPanel } from "@/components/dashboard/BatchActionsPanel";
import { ScholarsTableFiltered } from "@/components/dashboard/ScholarsTableFiltered";
import { AuditExportSection } from "@/components/dashboard/AuditExportSection";
import { PaymentsSummary } from "@/components/dashboard/PaymentsSummary";
import { UsersManagement } from "@/components/dashboard/UsersManagement";
import { AdminBanner } from "@/components/admin/AdminBanner";

const ManagerDashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminBanner />
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Manager Greeting */}
          <div className="animate-fade-in">
            <ManagerGreeting />
          </div>

          {/* Consolidated KPI Cards with Drilldown */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <ConsolidatedKPICards />
          </div>

          {/* Alerts Banner */}
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <AlertsBanner />
          </div>

          {/* Batch Actions Panel - Priority Queue */}
          <div className="animate-fade-in" style={{ animationDelay: "175ms" }}>
            <BatchActionsPanel />
          </div>

          {/* Audit & Export Section */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <AuditExportSection />
          </div>

          {/* Scholars Table with Advanced Filters */}
          <div className="animate-fade-in" style={{ animationDelay: "225ms" }}>
            <ScholarsTableFiltered />
          </div>

          {/* Payments Summary */}
          <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
            <PaymentsSummary />
          </div>

          {/* Users Management */}
          <div className="animate-fade-in" style={{ animationDelay: "275ms" }}>
            <UsersManagement />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ManagerDashboard;
