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
  AlertCircle
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

type ReportStatus = "pending" | "submitted" | "approved" | "rejected";
type PaymentStatus = "blocked" | "released" | "processing" | "paid";

interface Installment {
  id: string;
  number: number;
  referenceMonth: string;
  value: number;
  reportStatus: ReportStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  feedback?: string;
}

const installments: Installment[] = [
  { id: "1", number: 1, referenceMonth: "Janeiro/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "10/02/2024" },
  { id: "2", number: 2, referenceMonth: "Fevereiro/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "08/03/2024" },
  { id: "3", number: 3, referenceMonth: "Março/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "10/04/2024" },
  { id: "4", number: 4, referenceMonth: "Abril/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "09/05/2024" },
  { id: "5", number: 5, referenceMonth: "Maio/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "10/06/2024" },
  { id: "6", number: 6, referenceMonth: "Junho/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "08/07/2024" },
  { id: "7", number: 7, referenceMonth: "Julho/2024", value: 700, reportStatus: "approved", paymentStatus: "paid", paymentDate: "09/08/2024" },
  { id: "8", number: 8, referenceMonth: "Agosto/2024", value: 700, reportStatus: "submitted", paymentStatus: "processing" },
  { id: "9", number: 9, referenceMonth: "Setembro/2024", value: 700, reportStatus: "rejected", paymentStatus: "blocked", feedback: "Relatório incompleto. Faltam informações sobre as atividades realizadas na segunda quinzena do mês." },
  { id: "10", number: 10, referenceMonth: "Outubro/2024", value: 700, reportStatus: "pending", paymentStatus: "blocked" },
  { id: "11", number: 11, referenceMonth: "Novembro/2024", value: 700, reportStatus: "pending", paymentStatus: "blocked" },
  { id: "12", number: 12, referenceMonth: "Dezembro/2024", value: 700, reportStatus: "pending", paymentStatus: "blocked" },
];

const reportStatusConfig: Record<ReportStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pendente", icon: Clock, className: "bg-warning/10 text-warning" },
  submitted: { label: "Enviado", icon: FileUp, className: "bg-info/10 text-info" },
  approved: { label: "Aprovado", icon: CheckCircle, className: "bg-success/10 text-success" },
  rejected: { label: "Rejeitado", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  blocked: { label: "Bloqueado", className: "bg-muted text-muted-foreground" },
  released: { label: "Liberado", className: "bg-success/10 text-success" },
  processing: { label: "Processando", className: "bg-info/10 text-info" },
  paid: { label: "Pago", className: "bg-primary/10 text-primary" },
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

function InstallmentActions({ installment }: { installment: Installment }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const canSubmitReport = installment.reportStatus === "pending";
  const canResubmit = installment.reportStatus === "rejected";
  const canViewFeedback = installment.reportStatus === "rejected" && installment.feedback;
  const canDownloadReceipt = installment.paymentStatus === "paid";
  const hasVersions = installment.reportStatus !== "pending";

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
            <DropdownMenuItem className="gap-2">
              <History className="w-4 h-4" />
              Ver versões
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
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive mb-1">Relatório Rejeitado</p>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function InstallmentsTable() {
  return (
    <div className="card-institutional overflow-hidden p-0">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Histórico de Parcelas</h3>
        <p className="text-sm text-muted-foreground">Acompanhe o status de cada parcela da sua bolsa</p>
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
            {installments.map((installment) => (
              <tr key={installment.id}>
                <td>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                    {installment.number}
                  </span>
                </td>
                <td className="font-medium text-foreground">{installment.referenceMonth}</td>
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
                      config={paymentStatusConfig[installment.paymentStatus]} 
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
