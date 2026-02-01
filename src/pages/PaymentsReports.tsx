import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ScholarStats } from "@/components/scholar/ScholarStats";
import { InstallmentsTable } from "@/components/scholar/InstallmentsTable";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentsReports = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Back button and Scholar Info */}
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
                <h1 className="text-xl font-semibold text-foreground">Ana Carolina Silva</h1>
                <p className="text-muted-foreground">Bolsa: Iniciação Científica • Projeto: IA Aplicada à Saúde</p>
                <p className="text-sm text-muted-foreground mt-1">Vigência: Janeiro/2026 a Dezembro/2026</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-success/10 text-success">
                  <span className="w-2 h-2 rounded-full bg-current" />
                  Bolsa Ativa
                </span>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Pagamentos e Relatórios</h2>
            <p className="text-muted-foreground">Acompanhe suas parcelas e envie seus relatórios mensais</p>
          </div>

          {/* Stats Cards */}
          <div className="animate-fade-in">
            <ScholarStats />
          </div>

          {/* Installments Table */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <InstallmentsTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentsReports;
