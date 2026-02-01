import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Key,
  Pencil,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { EditScholarDataDialog } from "./EditScholarDataDialog";
import { useScholarEnrollment } from "@/hooks/useScholarEnrollment";

interface ScholarData {
  personal: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  project: {
    name: string;
    proponent: string;
    startDate: string;
    endDate: string;
    totalValue: number;
    monthlyValue: number;
    installments: number;
    progress: number;
  };
  bank: {
    bankName: string;
    agency: string;
    account: string;
    accountType: string;
    pixKey: string;
    validationStatus: "validated" | "pending" | "rejected";
  };
}

// Initial empty data - only name, cpf and email come from registration
const getInitialScholarData = (): ScholarData => ({
  personal: {
    name: "", // Will be loaded from profile
    cpf: "", // Will be loaded from profile
    email: "", // Will be loaded from profile
    phone: "", // Empty - user must fill
  },
  project: {
    name: "",
    proponent: "",
    startDate: "",
    endDate: "",
    totalValue: 0,
    monthlyValue: 0,
    installments: 0,
    progress: 0,
  },
  bank: {
    bankName: "",
    agency: "",
    account: "",
    accountType: "",
    pixKey: "",
    validationStatus: "pending",
  },
});

function maskCPF(cpf: string): string {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.$2.***-**");
}

function maskAccount(account: string): string {
  return account.replace(/(\d+)-(\d)/, "****-$2");
}

function maskPixKey(key: string): string {
  if (key.includes("@")) {
    const [name, domain] = key.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return key.replace(/(.{3})(.*)(.{2})/, "$1***$3");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface DataRowProps {
  icon: typeof User;
  label: string;
  value: string;
  masked?: boolean;
  showSensitive?: boolean;
  maskedValue?: string;
}

function DataRow({ icon: Icon, label, value, masked, showSensitive, maskedValue }: DataRowProps) {
  const displayValue = masked && !showSensitive && maskedValue ? maskedValue : value;
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={cn(
          "text-sm font-medium text-foreground",
          masked && !showSensitive && "font-mono"
        )}>
          {displayValue}
        </p>
      </div>
      {masked && (
        <div className="flex-shrink-0">
          {showSensitive ? (
            <Eye className="w-4 h-4 text-muted-foreground" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            value >= 75 ? "bg-success" : value >= 50 ? "bg-info" : value >= 25 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const validationStatusConfig = {
  validated: { label: "Validado", icon: ShieldCheck, className: "bg-success/10 text-success" },
  pending: { label: "Pendente", icon: ShieldAlert, className: "bg-warning/10 text-warning" },
  rejected: { label: "Rejeitado", icon: ShieldAlert, className: "bg-destructive/10 text-destructive" },
};

export function ScholarDataCards() {
  const [showSensitive, setShowSensitive] = useState(false);
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editBankOpen, setEditBankOpen] = useState(false);
  const { hasActiveEnrollment } = useScholarEnrollment();
  
  // Initialize with empty data - only name, cpf and email will be loaded from profile
  const initialData = getInitialScholarData();
  const [personalData, setPersonalData] = useState(initialData.personal);
  const [bankData, setBankData] = useState(initialData.bank);
  const [projectData] = useState(initialData.project);

  const validationConfig = validationStatusConfig[bankData.validationStatus];
  const ValidationIcon = validationConfig.icon;

  const handleSavePersonal = (data: typeof initialData.personal) => {
    setPersonalData(data as typeof initialData.personal);
  };

  const handleSaveBank = (data: typeof initialData.bank) => {
    setBankData({
      ...data as typeof initialData.bank,
      validationStatus: "pending", // Reset to pending after edit
    });
  };

  return (
    <div className="space-y-6">
      {/* Reveal Button */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={showSensitive ? "outline" : "default"} className="gap-2">
              {showSensitive ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar Dados Sensíveis
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Revelar Dados Sensíveis
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {showSensitive ? "Ocultar dados sensíveis?" : "Revelar dados sensíveis?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {showSensitive 
                  ? "Os dados sensíveis como CPF, conta bancária e chave Pix serão mascarados novamente."
                  : "Você está prestes a visualizar dados sensíveis do bolsista, incluindo CPF completo, número da conta e chave Pix. Esta ação será registrada no sistema por motivos de segurança e auditoria."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => setShowSensitive(!showSensitive)}>
                {showSensitive ? "Ocultar" : "Confirmar e Revelar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Data */}
        <div className="card-institutional">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Dados Pessoais</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-primary hover:text-primary"
              onClick={() => setEditPersonalOpen(true)}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </div>

          <div className="space-y-0">
            <DataRow 
              icon={User} 
              label="Nome Completo" 
              value={personalData.name} 
            />
            <DataRow 
              icon={CreditCard} 
              label="CPF" 
              value={personalData.cpf}
              masked
              showSensitive={showSensitive}
              maskedValue={maskCPF(personalData.cpf)}
            />
            <DataRow 
              icon={Mail} 
              label="E-mail" 
              value={personalData.email} 
            />
            <DataRow 
              icon={Phone} 
              label="Telefone" 
              value={personalData.phone} 
            />
          </div>
        </div>

        {/* Project Data */}
        <div className="card-institutional">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-info" />
            </div>
            <h3 className="font-semibold text-foreground">Dados do Projeto</h3>
          </div>

          {hasActiveEnrollment ? (
            <div className="space-y-0">
              <DataRow 
                icon={Briefcase} 
                label="Nome do Projeto" 
                value={projectData.name || "—"} 
              />
              <DataRow 
                icon={User} 
                label="Proponente" 
                value={projectData.proponent || "—"} 
              />
              <DataRow 
                icon={Calendar} 
                label="Início" 
                value={projectData.startDate || "—"} 
              />
              <DataRow 
                icon={Calendar} 
                label="Fim" 
                value={projectData.endDate || "—"} 
              />
              <DataRow 
                icon={DollarSign} 
                label="Valor Total" 
                value={projectData.totalValue ? formatCurrency(projectData.totalValue) : "—"} 
              />
              <DataRow 
                icon={DollarSign} 
                label="Parcela Mensal" 
                value={projectData.monthlyValue ? formatCurrency(projectData.monthlyValue) : "—"} 
              />
              <DataRow 
                icon={Calendar} 
                label="Parcelas" 
                value={projectData.installments ? `${projectData.installments} meses` : "—"} 
              />
              
              {projectData.progress > 0 && (
                <div className="pt-3">
                  <ProgressBar value={projectData.progress} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <p className="text-muted-foreground text-sm">
                Projeto ainda não atribuído pelo gestor responsável.
              </p>
            </div>
          )}
        </div>

        {/* Bank Data */}
        <div className="card-institutional">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Dados Bancários</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-success hover:text-success"
              onClick={() => setEditBankOpen(true)}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </div>

          <div className="space-y-0">
            <DataRow 
              icon={Building2} 
              label="Banco" 
              value={bankData.bankName} 
            />
            <DataRow 
              icon={Building2} 
              label="Agência" 
              value={bankData.agency} 
            />
            <DataRow 
              icon={CreditCard} 
              label="Conta" 
              value={bankData.account}
              masked
              showSensitive={showSensitive}
              maskedValue={maskAccount(bankData.account)}
            />
            <DataRow 
              icon={CreditCard} 
              label="Tipo de Conta" 
              value={bankData.accountType} 
            />
            <DataRow 
              icon={Key} 
              label="Chave Pix" 
              value={bankData.pixKey}
              masked
              showSensitive={showSensitive}
              maskedValue={maskPixKey(bankData.pixKey)}
            />
            
            {/* Validation Status */}
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Status de Validação</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                validationConfig.className
              )}>
                <ValidationIcon className="w-4 h-4" />
                {validationConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialogs */}
      <EditScholarDataDialog
        open={editPersonalOpen}
        onOpenChange={setEditPersonalOpen}
        type="personal"
        personalData={personalData}
        onSave={handleSavePersonal}
      />
      <EditScholarDataDialog
        open={editBankOpen}
        onOpenChange={setEditBankOpen}
        type="bank"
        bankData={bankData}
        onSave={handleSaveBank}
      />
    </div>
  );
}
