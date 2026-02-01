import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ScholarGreeting } from "@/components/scholar/ScholarGreeting";
import { ScholarSummaryCards } from "@/components/scholar/ScholarSummaryCards";
import { ScholarWorkflowBanner } from "@/components/scholar/ScholarWorkflowBanner";
import { GrantTermSection } from "@/components/scholar/GrantTermSection";
import { DocumentsSection } from "@/components/scholar/DocumentsSection";
import { InstallmentsTable } from "@/components/scholar/InstallmentsTable";
import { AwaitingAssignmentBanner } from "@/components/scholar/AwaitingAssignmentBanner";
import { BankDataPendingBanner } from "@/components/scholar/BankDataPendingBanner";
import { BankDataValidationBanner } from "@/components/scholar/BankDataValidationBanner";
import { useScholarEnrollment } from "@/hooks/useScholarEnrollment";
import { useBankDataStatus } from "@/hooks/useBankDataStatus";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { hasActiveEnrollment, loading: enrollmentLoading } = useScholarEnrollment();
  const { status: bankStatus, loading: bankLoading } = useBankDataStatus();

  const loading = enrollmentLoading || bankLoading;

  const handleNavigateToProfile = () => {
    navigate("/perfil-bolsista");
  };

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
          ) : !hasActiveEnrollment ? (
            /* Awaiting Assignment State - Project empty, reports blocked, payments hidden */
            <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <AwaitingAssignmentBanner />
            </div>
          ) : (
            <>
              {/* Bank Data Status Banners */}
              {bankStatus === "not_filled" && (
                <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <BankDataPendingBanner onNavigateToProfile={handleNavigateToProfile} />
                </div>
              )}
              
              {(bankStatus === "pending" || bankStatus === "rejected") && (
                <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <BankDataValidationBanner status={bankStatus} />
                </div>
              )}

              {/* Summary Cards */}
              <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <ScholarSummaryCards />
              </div>

              {/* Workflow Banner */}
              <div className="animate-fade-in" style={{ animationDelay: "175ms" }}>
                <ScholarWorkflowBanner />
              </div>

              {/* Grant Term Section */}
              <div className="animate-fade-in" style={{ animationDelay: "190ms" }}>
                <GrantTermSection />
              </div>

              {/* Documents Section */}
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <DocumentsSection />
              </div>

              {/* Installments Table - Only show if bank data is validated */}
              {bankStatus === "validated" && (
                <div className="animate-fade-in" style={{ animationDelay: "210ms" }}>
                  <InstallmentsTable />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
