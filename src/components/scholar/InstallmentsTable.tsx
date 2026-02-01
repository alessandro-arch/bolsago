import { useState } from "react";
import { 
  FileUp, 
  RefreshCw, 
  History, 
  FileSearch, 
  Download, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  CalendarClock,
  Lock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReportVersionsDialog, type ReportVersion } from "./ReportVersionsDialog";
import type { PaymentWithReport } from "@/hooks/useScholarPayments";
import { format, parseISO, isFuture, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type ReportStatus = "pending" | "submitted" | "under_review" | "approved" | "rejected" | "future";
type PaymentStatus = "blocked" | "eligible" | "processing" | "paid" | "future" | "pending" | "cancelled";
type MonthStatus = "past" | "current" | "future";

interface Installment {
  id: string;
  number: number;
  referenceMonth: string;
  value: number;
  reportStatus: ReportStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  feedback?: string;
  isFirstInstallment?: boolean;
  versions?: ReportVersion[];
  monthStatus: MonthStatus;
}

const reportStatusConfig: Record<ReportStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pendente", icon: Clock, className: "bg-warning/10 text-warning" },
  submitted: { label: "Enviado", icon: FileUp, className: "bg-info/10 text-info" },
  under_review: { label: "Em Análise", icon: Search, className: "bg-primary/10 text-primary" },
  approved: { label: "Aprovado", icon: CheckCircle, className: "bg-success/10 text-success" },
  rejected: { label: "Devolvido", icon: XCircle, className: "bg-destructive/10 text-destructive" },
  future: { label: "Aguardando", icon: CalendarClock, className: "bg-muted text-muted-foreground" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  blocked: { label: "Bloqueado", className: "bg-destructive/10 text-destructive" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
  eligible: { label: "Apto", className: "bg-success/10 text-success" },
  processing: { label: "Processando", className: "bg-info/10 text-info" },
  paid: { label: "Pago", className: "bg-success/10 text-success" },
  future: { label: "Futuro", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function StatusBadge({ status, config }: { status: string; config: { label: string; className: string } }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

function MonthIndicator({ monthStatus }: { monthStatus: MonthStatus }) {
  if (monthStatus === "current") {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
        MÊS ATUAL
      </span>
    );
  }
  if (monthStatus === "future") {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
        FUTURO
      </span>
    );
  }
  return null;
}

function InstallmentActions({ installment }: { installment: Installment }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const isFutureMonth = installment.monthStatus === "future";
  const isCurrent = installment.monthStatus === "current";
  const canSubmitReport = (isCurrent && installment.reportStatus === "pending");
  const canResubmit = installment.reportStatus === "rejected";
  const canViewFeedback = installment.reportStatus === "rejected" && installment.feedback;
  const canDownloadReceipt = installment.paymentStatus === "paid";
  const hasVersions = installment.versions && installment.versions.length > 0;

  // Future months - no actions available
  if (isFutureMonth) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span className="text-xs">Aguardando período</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Primary Action Button */}
      {canSubmitReport && (
        <Button size="sm" className="gap-1.5">
          <FileUp className="w-3.5 h-3.5" />
          Enviar Relatório
        </Button>
      )}
      
      {canResubmit && (
        <Button size="sm" variant="outline" className="gap-1.5 border-warning text-warning hover:bg-warning/10">
          <RefreshCw className="w-3.5 h-3.5" />
          Reenviar
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded hover:bg-muted transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {hasVersions && (
            <DropdownMenuItem 
              className="gap-2"
              onSelect={() => setVersionsOpen(true)}
            >
              <History className="w-4 h-4" />
              Ver versões ({installment.versions?.length})
            </DropdownMenuItem>
          )}
          
          {canViewFeedback && (
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2" onSelect={(e) => e.preventDefault()}>
                  <FileSearch className="w-4 h-4" />
                  Visualizar parecer
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Parecer - {installment.referenceMonth}</DialogTitle>
                  <DialogDescription>
                    Feedback do gestor sobre o relatório enviado
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive mb-1">Relatório Devolvido</p>
                      <p className="text-sm text-foreground">{installment.feedback}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
                    Fechar
                  </Button>
                  <Button className="gap-1.5">
                    <RefreshCw className="w-4 h-4" />
                    Reenviar Relatório
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {canDownloadReceipt && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <Download className="w-4 h-4" />
                Baixar comprovante
              </DropdownMenuItem>
            </>
          )}

          {!hasVersions && !canViewFeedback && !canDownloadReceipt && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              Nenhuma ação disponível
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Versions Dialog */}
      {hasVersions && (
        <ReportVersionsDialog
          open={versionsOpen}
          onOpenChange={setVersionsOpen}
          referenceMonth={installment.referenceMonth}
          versions={installment.versions || []}
        />
      )}
    </div>
  );
}

interface InstallmentsTableProps {
  payments: PaymentWithReport[];
  grantValue: number;
  startDate: string;
  loading?: boolean;
}

function getMonthStatus(referenceMonth: string): MonthStatus {
  try {
    // Parse YYYY-MM format
    const [year, month] = referenceMonth.split("-").map(Number);
    const refDate = new Date(year, month - 1, 1);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (refDate.getTime() === currentMonth.getTime()) {
      return "current";
    } else if (refDate > currentMonth) {
      return "future";
    }
    return "past";
  } catch {
    return "past";
  }
}

function formatReferenceMonth(refMonth: string): string {
  try {
    const [year, month] = refMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, "MMMM/yyyy", { locale: ptBR });
  } catch {
    return refMonth;
  }
}

function mapPaymentToInstallment(payment: PaymentWithReport, grantValue: number): Installment {
  const monthStatus = getMonthStatus(payment.reference_month);
  
  // Map report status
  let reportStatus: ReportStatus = "pending";
  if (monthStatus === "future") {
    reportStatus = "future";
  } else if (payment.report) {
    const status = payment.report.status;
    if (status === "under_review") reportStatus = "under_review";
    else if (status === "approved") reportStatus = "approved";
    else if (status === "rejected") reportStatus = "rejected";
    else reportStatus = "submitted";
  }

  // Map payment status
  let paymentStatus: PaymentStatus = payment.status as PaymentStatus;
  if (monthStatus === "future") {
    paymentStatus = "future";
  }

  return {
    id: payment.id,
    number: payment.installment_number,
    referenceMonth: formatReferenceMonth(payment.reference_month),
    value: Number(payment.amount),
    reportStatus,
    paymentStatus,
    paymentDate: payment.paid_at ? format(parseISO(payment.paid_at), "dd/MM/yyyy") : undefined,
    feedback: payment.report?.feedback || undefined,
    isFirstInstallment: payment.installment_number === 1,
    monthStatus,
  };
}

export function InstallmentsTable({ 
  payments, 
  grantValue, 
  startDate,
  loading = false 
}: InstallmentsTableProps) {
  const installments = payments.map(p => mapPaymentToInstallment(p, grantValue));
  
  const paidCount = installments.filter(i => i.paymentStatus === "paid").length;
  const blockedCount = installments.filter(i => i.paymentStatus === "pending" || i.paymentStatus === "blocked").length;
  const pendingReportCount = installments.filter(i => i.reportStatus === "pending" || i.reportStatus === "rejected").length;

  if (loading) {
    return (
      <div className="card-institutional overflow-hidden p-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando parcelas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-institutional overflow-hidden p-0">
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Histórico de Parcelas</h3>
            <p className="text-sm text-muted-foreground">Acompanhe o status de cada parcela da sua bolsa</p>
          </div>
          
          {/* Summary badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">{paidCount} pagas</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">{blockedCount} bloqueadas</span>
            </div>
            {pendingReportCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-warning font-medium">{pendingReportCount} relatório(s) pendente(s)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-institutional">
          <thead>
            <tr>
              <th>Parcela</th>
              <th>Mês de Referência</th>
              <th>Valor</th>
              <th>Status do Relatório</th>
              <th>Status do Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Nenhuma parcela registrada</p>
                      <p className="text-sm text-muted-foreground">
                        As parcelas serão exibidas após o vínculo com o termo de concessão.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              installments.map((installment) => (
              <tr 
                key={installment.id}
                className={cn(
                  installment.monthStatus === "current" && "bg-primary/5",
                  installment.monthStatus === "future" && "opacity-60"
                )}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      installment.monthStatus === "current" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      {installment.number}
                    </span>
                    {installment.isFirstInstallment && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        Auto
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground capitalize">{installment.referenceMonth}</span>
                    <MonthIndicator monthStatus={installment.monthStatus} />
                  </div>
                </td>
                <td className="font-medium text-foreground">{formatCurrency(installment.value)}</td>
                <td>
                  <StatusBadge 
                    status={installment.reportStatus} 
                    config={reportStatusConfig[installment.reportStatus]} 
                  />
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <StatusBadge 
                      status={installment.paymentStatus} 
                      config={paymentStatusConfig[installment.paymentStatus] || paymentStatusConfig.pending} 
                    />
                    {installment.paymentDate && (
                      <span className="text-xs text-muted-foreground">{installment.paymentDate}</span>
                    )}
                  </div>
                </td>
                <td>
                  <InstallmentActions installment={installment} />
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          O envio de relatório está disponível apenas para o mês atual ou para relatórios devolvidos que precisam de correção.
        </p>
      </div>
    </div>
  );
}
