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
  TrendingUp,
  Pencil
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

const scholarData: ScholarData = {
  personal: {
    name: "Ana Carolina Silva",
    cpf: "123.456.789-00",
    email: "ana.silva@email.com",
    phone: "(11) 98765-4321",
  },
  project: {
    name: "IA Aplicada à Saúde",
    proponent: "Dr. Ricardo Mendes",
    startDate: "01/01/2024",
    endDate: "31/12/2024",
    totalValue: 8400,
    monthlyValue: 700,
    installments: 12,
    progress: 75,
  },
  bank: {
    bankName: "Banco do Brasil",
    agency: "1234-5",
    account: "12345-6",
    accountType: "Conta Corrente",
    pixKey: "ana.silva@email.com",
    validationStatus: "validated",
  },
};

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
  const [personalData, setPersonalData] = useState(scholarData.personal);
  const [bankData, setBankData] = useState(scholarData.bank);

  const validationConfig = validationStatusConfig[bankData.validationStatus];
  const ValidationIcon = validationConfig.icon;

  const handleSavePersonal = (data: typeof scholarData.personal) => {
    setPersonalData(data as typeof scholarData.personal);
  };

  const handleSaveBank = (data: typeof scholarData.bank) => {
    setBankData({
      ...data as typeof scholarData.bank,
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

          <div className="space-y-0">
            <DataRow 
              icon={Briefcase} 
              label="Nome do Projeto" 
              value={scholarData.project.name} 
            />
            <DataRow 
              icon={User} 
              label="Proponente" 
              value={scholarData.project.proponent} 
            />
            <DataRow 
              icon={Calendar} 
              label="Início" 
              value={scholarData.project.startDate} 
            />
            <DataRow 
              icon={Calendar} 
              label="Fim" 
              value={scholarData.project.endDate} 
            />
            <DataRow 
              icon={DollarSign} 
              label="Valor Total" 
              value={formatCurrency(scholarData.project.totalValue)} 
            />
            <DataRow 
              icon={DollarSign} 
              label="Parcela Mensal" 
              value={formatCurrency(scholarData.project.monthlyValue)} 
            />
            <DataRow 
              icon={Calendar} 
              label="Parcelas" 
              value={`${scholarData.project.installments} meses`} 
            />
            
            <div className="pt-3">
              <ProgressBar value={scholarData.project.progress} />
            </div>
          </div>
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
