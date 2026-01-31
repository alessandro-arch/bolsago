import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScholarsTable } from "@/components/dashboard/ScholarsTable";
import { PaymentsSummary } from "@/components/dashboard/PaymentsSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, GraduationCap, DollarSign, AlertCircle } from "lucide-react";

const stats = [
  {
    title: "Total de Bolsistas",
    value: "247",
    change: "+12 este mês",
    changeType: "positive" as const,
    icon: Users,
    iconColor: "primary" as const,
  },
  {
    title: "Bolsas Ativas",
    value: "198",
    change: "80% do total",
    changeType: "neutral" as const,
    icon: GraduationCap,
    iconColor: "success" as const,
  },
  {
    title: "Valor Total Mensal",
    value: "R$ 145.600",
    change: "+8% vs mês anterior",
    changeType: "positive" as const,
    icon: DollarSign,
    iconColor: "info" as const,
  },
  {
    title: "Pendências",
    value: "23",
    change: "Documentos faltando",
    changeType: "negative" as const,
    icon: AlertCircle,
    iconColor: "warning" as const,
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do sistema de gestão de bolsas</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 animate-fade-in">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table - spans 2 columns */}
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <ScholarsTable />
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <PaymentsSummary />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
