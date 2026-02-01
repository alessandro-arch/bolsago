import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ScholarGreeting } from "@/components/scholar/ScholarGreeting";
import { ScholarSummaryCards } from "@/components/scholar/ScholarSummaryCards";
import { WorkflowBanner } from "@/components/dashboard/WorkflowBanner";
import { InstallmentsTable } from "@/components/scholar/InstallmentsTable";

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Scholar Greeting */}
          <div className="animate-fade-in">
            <ScholarGreeting />
          </div>

          {/* Summary Cards */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <ScholarSummaryCards />
          </div>

          {/* Workflow Banner */}
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <WorkflowBanner />
          </div>

          {/* Installments Table */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <InstallmentsTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
