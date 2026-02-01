import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ScholarGreeting } from "@/components/scholar/ScholarGreeting";
import { ScholarSummaryCards } from "@/components/scholar/ScholarSummaryCards";
import { ScholarWorkflowBanner } from "@/components/scholar/ScholarWorkflowBanner";
import { GrantTermSection } from "@/components/scholar/GrantTermSection";
import { DocumentsSection } from "@/components/scholar/DocumentsSection";
import { InstallmentsTable } from "@/components/scholar/InstallmentsTable";
import { AwaitingAssignmentBanner } from "@/components/scholar/AwaitingAssignmentBanner";
import { useScholarEnrollment } from "@/hooks/useScholarEnrollment";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { hasActiveEnrollment, loading } = useScholarEnrollment();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Scholar Greeting */}
          <div className="animate-fade-in">
            <ScholarGreeting hasActiveEnrollment={hasActiveEnrollment} loading={loading} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : hasActiveEnrollment ? (
            <>
              {/* Summary Cards */}
              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <ScholarSummaryCards />
              </div>

              {/* Workflow Banner */}
              <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <ScholarWorkflowBanner />
              </div>

              {/* Grant Term Section */}
              <div className="animate-fade-in" style={{ animationDelay: "175ms" }}>
                <GrantTermSection />
              </div>

              {/* Documents Section */}
              <div className="animate-fade-in" style={{ animationDelay: "190ms" }}>
                <DocumentsSection />
              </div>

              {/* Installments Table */}
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <InstallmentsTable />
              </div>
            </>
          ) : (
            /* Awaiting Assignment Banner */
            <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <AwaitingAssignmentBanner />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
