import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ManagerGreeting } from "@/components/dashboard/ManagerGreeting";
import { KPICards } from "@/components/dashboard/KPICards";
import { AlertsBanner } from "@/components/dashboard/AlertsBanner";
import { ScholarsTableFiltered } from "@/components/dashboard/ScholarsTableFiltered";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PaymentsSummary } from "@/components/dashboard/PaymentsSummary";

const ManagerDashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Manager Greeting */}
          <div className="animate-fade-in">
            <ManagerGreeting />
          </div>

          {/* KPI Cards */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <KPICards />
          </div>

          {/* Alerts Banner */}
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <AlertsBanner />
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in" style={{ animationDelay: "175ms" }}>
            <QuickActions />
          </div>

          {/* Scholars Table */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <ScholarsTableFiltered />
          </div>

          {/* Payments Summary */}
          <div className="animate-fade-in" style={{ animationDelay: "225ms" }}>
            <PaymentsSummary />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
