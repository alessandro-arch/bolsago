import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ManagerGreeting } from "@/components/dashboard/ManagerGreeting";
import { KPICards } from "@/components/dashboard/KPICards";
import { AlertsBanner } from "@/components/dashboard/AlertsBanner";
import { WorkflowBanner } from "@/components/dashboard/WorkflowBanner";
import { ScholarsTableFiltered } from "@/components/dashboard/ScholarsTableFiltered";

const daySummary = {
  pendingReports: 34,
  paymentsToRelease: 142,
  newScholars: 5,
};

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Manager Greeting */}
          <div className="animate-fade-in">
            <ManagerGreeting managerName="Dr. Ricardo" summary={daySummary} />
          </div>

          {/* KPI Cards */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <KPICards />
          </div>

          {/* Alerts Banner */}
          <div className="animate-fade-in" style={{ animationDelay: "125ms" }}>
            <AlertsBanner />
          </div>

          {/* Workflow Banner */}
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <WorkflowBanner />
          </div>

          {/* Scholars Table */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <ScholarsTableFiltered />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
