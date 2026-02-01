import { DollarSign, GraduationCap, Calendar, FileCheck } from "lucide-react";

interface ScholarSummaryCard {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgClass: string;
}

const summaryCards: ScholarSummaryCard[] = [
  {
    title: "Valor Mensal",
    value: "R$ 700,00",
    subtitle: "Bruto",
    icon: <DollarSign className="w-5 h-5" />,
    iconBgClass: "bg-success/10 text-success",
  },
  {
    title: "Tipo de Bolsa",
    value: "Iniciação Científica",
    subtitle: "PIBIC/CNPq",
    icon: <GraduationCap className="w-5 h-5" />,
    iconBgClass: "bg-primary/10 text-primary",
  },
  {
    title: "Total de Parcelas",
    value: "12",
    subtitle: "7 pagas • 5 pendentes",
    icon: <Calendar className="w-5 h-5" />,
    iconBgClass: "bg-info/10 text-info",
  },
  {
    title: "Documentos Aprovados",
    value: "7",
    subtitle: "de 12 relatórios",
    icon: <FileCheck className="w-5 h-5" />,
    iconBgClass: "bg-warning/10 text-warning",
  },
];

export function ScholarSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <div
          key={index}
          className="card-stat flex items-start gap-4"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBgClass}`}>
            {card.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.title}
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5 truncate">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
