import { DollarSign, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ScholarStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: "primary" | "success" | "info" | "warning";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
};

export function ScholarStatCard({ title, value, subtitle, icon: Icon, color }: ScholarStatCardProps) {
  return (
    <div className="card-stat">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const stats: ScholarStatCardProps[] = [
  {
    title: "Total Previsto",
    value: "R$ 8.400",
    subtitle: "12 parcelas de R$ 700",
    icon: TrendingUp,
    color: "primary",
  },
  {
    title: "Total Recebido",
    value: "R$ 4.900",
    subtitle: "7 parcelas pagas",
    icon: DollarSign,
    color: "success",
  },
  {
    title: "Relatórios Enviados",
    value: "8",
    subtitle: "de 12 meses",
    icon: FileText,
    color: "info",
  },
  {
    title: "Pendentes de Envio",
    value: "1",
    subtitle: "mês atual",
    icon: AlertCircle,
    color: "warning",
  },
];

export function ScholarStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <ScholarStatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
