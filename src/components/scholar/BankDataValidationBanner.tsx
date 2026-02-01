import { ShieldAlert, Clock, CheckCircle } from "lucide-react";

type ValidationStatus = "pending" | "validated" | "rejected";

interface BankDataValidationBannerProps {
  status: ValidationStatus;
}

const statusConfig = {
  pending: {
    icon: Clock,
    title: "Dados Bancários em Validação",
    description: "Seus dados bancários foram enviados e estão aguardando validação pelo gestor responsável. Os campos estão bloqueados para edição durante este período.",
    className: "bg-gradient-to-r from-info/5 via-background to-muted/30 border-info/30",
    iconClassName: "bg-info/10 text-info",
    badgeClassName: "bg-info/10 text-info",
    badgeText: "Em análise",
  },
  validated: {
    icon: CheckCircle,
    title: "Dados Bancários Validados",
    description: "Seus dados bancários foram verificados e aprovados. Você está apto a receber os pagamentos das suas parcelas.",
    className: "bg-gradient-to-r from-success/5 via-background to-muted/30 border-success/30",
    iconClassName: "bg-success/10 text-success",
    badgeClassName: "bg-success/10 text-success",
    badgeText: "Aprovado",
  },
  rejected: {
    icon: ShieldAlert,
    title: "Dados Bancários Rejeitados",
    description: "Seus dados bancários foram rejeitados. Aguarde instruções do gestor responsável para correção.",
    className: "bg-gradient-to-r from-destructive/5 via-background to-muted/30 border-destructive/30",
    iconClassName: "bg-destructive/10 text-destructive",
    badgeClassName: "bg-destructive/10 text-destructive",
    badgeText: "Rejeitado",
  },
};

export function BankDataValidationBanner({ status }: BankDataValidationBannerProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Only show banner for pending and rejected states
  if (status === "validated") {
    return null;
  }

  return (
    <div className={`card-institutional mb-6 ${config.className}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {config.title}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeClassName}`}>
              {config.badgeText}
            </span>
          </div>
          
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}
