import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScholarStats } from "@/components/scholar/ScholarStats";
import { InstallmentsTable } from "@/components/scholar/InstallmentsTable";
import { ArrowLeft, User, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScholarPayments } from "@/hooks/useScholarPayments";
import { useScholarProfile } from "@/hooks/useScholarProfile";
import { getModalityLabel } from "@/lib/modality-labels";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMMM/yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}


const PaymentsReports = () => {
  const { data, loading, error, refresh } = useScholarPayments();
  const { personalData } = useScholarProfile();

  const hasEnrollment = !!data?.enrollment;
  const enrollment = data?.enrollment;
  const project = enrollment?.project;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Back button */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>

          {/* Scholar Profile Header */}
          <div className="card-institutional mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-40 bg-muted rounded animate-pulse mt-1" />
                  </div>
                ) : hasEnrollment && project ? (
                  <>
                    <h1 className="text-xl font-semibold text-foreground">
                      {personalData.name || "Bolsista"}
                    </h1>
                    <p className="text-muted-foreground">
                      Bolsa: {project.modalidade_bolsa || getModalityLabel(enrollment.modality)} • Projeto: {project.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vigência: {formatDate(enrollment.start_date)} a {formatDate(enrollment.end_date)}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl font-semibold text-foreground">
                      {personalData.name || "Bolsista"}
                    </h1>
                    <p className="text-muted-foreground">Aguardando atribuição de bolsa</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
                ) : hasEnrollment ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-success/10 text-success">
                    <span className="w-2 h-2 rounded-full bg-current" />
                    Bolsa Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-warning/10 text-warning">
                    <Clock className="w-4 h-4" />
                    Aguardando Atribuição
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Pagamentos e Relatórios</h2>
            <p className="text-muted-foreground">Acompanhe suas parcelas e envie seus relatórios mensais</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="card-institutional bg-destructive/5 border-destructive/20 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* No enrollment state */}
          {!loading && !hasEnrollment && (
            <div className="card-institutional">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aguardando Atribuição de Bolsa
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Os pagamentos e relatórios serão exibidos após o gestor atribuir um subprojeto à sua conta.
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards - only show if has enrollment */}
          {(loading || hasEnrollment) && (
            <div className="animate-fade-in">
              <ScholarStats 
                totalForecast={data?.stats.totalForecast || 0}
                totalReceived={data?.stats.totalReceived || 0}
                totalInstallments={data?.stats.totalInstallments || 0}
                paidInstallments={data?.stats.paidInstallments || 0}
                reportsSent={data?.stats.reportsSent || 0}
                pendingReports={data?.stats.pendingReports || 0}
                grantValue={enrollment ? Number(enrollment.grant_value) : 0}
                loading={loading}
              />
            </div>
          )}

          {/* Installments Table - only show if has enrollment */}
          {(loading || hasEnrollment) && (
            <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <InstallmentsTable 
                payments={data?.payments || []}
                grantValue={enrollment ? Number(enrollment.grant_value) : 0}
                startDate={enrollment?.start_date || ""}
                loading={loading}
                onRefresh={refresh}
                enrollmentId={enrollment?.id || ""}
              />
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default PaymentsReports;
