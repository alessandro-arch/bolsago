import { useState, useEffect } from "react";
import {
  DollarSign,
  CheckCircle,
  Clock,
  Lock,
  Filter,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  ChevronDown,
  Receipt,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentWithDetails {
  id: string;
  user_id: string;
  enrollment_id: string;
  reference_month: string;
  installment_number: number;
  amount: number;
  status: string;
  paid_at: string | null;
  report_id: string | null;
  scholar_name: string;
  scholar_email: string;
  project_title: string;
  project_code: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pendente", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  eligible: { label: "Liberado", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  paid: { label: "Pago", icon: CreditCard, className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelado", icon: Lock, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function formatReferenceMonth(refMonth: string): string {
  try {
    const [year, month] = refMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, "MMMM/yyyy", { locale: ptBR });
  } catch {
    return refMonth;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function PaymentsManagement() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [isOpen, setIsOpen] = useState(true);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("eligible");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Payment confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch payments with enrollment data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          enrollment:enrollments(
            id,
            user_id,
            project:projects(id, title, code)
          )
        `)
        .order("reference_month", { ascending: false });

      if (paymentsError) throw paymentsError;

      if (!paymentsData || paymentsData.length === 0) {
        setPayments([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(paymentsData.map(p => p.user_id))];

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      // Build enriched payments
      const enrichedPayments: PaymentWithDetails[] = paymentsData.map(payment => {
        const profile = profiles?.find(p => p.user_id === payment.user_id);
        const enrollment = payment.enrollment as { 
          id: string; 
          user_id: string;
          project: { id: string; title: string; code: string } | null;
        } | null;

        return {
          id: payment.id,
          user_id: payment.user_id,
          enrollment_id: payment.enrollment_id,
          reference_month: payment.reference_month,
          installment_number: payment.installment_number,
          amount: Number(payment.amount),
          status: payment.status,
          paid_at: payment.paid_at,
          report_id: payment.report_id,
          scholar_name: profile?.full_name || "Nome não disponível",
          scholar_email: profile?.email || "",
          project_title: enrollment?.project?.title || "Projeto não encontrado",
          project_code: enrollment?.project?.code || "",
        };
      });

      setPayments(enrichedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch = 
      searchTerm === "" ||
      payment.scholar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_month.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleOpenConfirm = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setConfirmDialogOpen(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment || !user) return;
    setSubmitting(true);

    try {
      const now = new Date().toISOString();

      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: now,
        })
        .eq("id", selectedPayment.id);

      if (paymentError) throw paymentError;

      // Log audit
      await logAction({
        action: "mark_payment_paid",
        entityType: "payment",
        entityId: selectedPayment.id,
        details: {
          scholar_id: selectedPayment.user_id,
          scholar_name: selectedPayment.scholar_name,
          reference_month: selectedPayment.reference_month,
          amount: selectedPayment.amount,
          paid_at: now,
        },
      });

      toast.success("Pagamento registrado com sucesso!");
      setConfirmDialogOpen(false);
      fetchPayments();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Erro ao registrar pagamento");
    } finally {
      setSubmitting(false);
    }
  };

  const eligibleCount = payments.filter(p => p.status === "eligible").length;
  const totalEligibleAmount = payments
    .filter(p => p.status === "eligible")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="card-institutional overflow-hidden p-0">
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">
                  Gestão de Pagamentos
                </h2>
                <p className="text-sm text-muted-foreground">
                  {eligibleCount > 0 
                    ? `${eligibleCount} pagamento(s) liberado(s) • ${formatCurrency(totalEligibleAmount)}`
                    : "Nenhum pagamento liberado no momento"
                  }
                </p>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border">
            {/* Filters */}
            <div className="p-4 bg-muted/30 flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por bolsista, projeto ou mês..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="eligible">Liberados</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchPayments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Payments List */}
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando pagamentos...</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">
                    {statusFilter === "eligible" 
                      ? "Nenhum pagamento liberado para processamento"
                      : "Nenhum pagamento encontrado"
                    }
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <div key={payment.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">
                                {payment.scholar_name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {payment.project_code}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {formatReferenceMonth(payment.reference_month)} • Parcela {payment.installment_number}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                                config.className
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatCurrency(payment.amount)}
                              </span>
                              {payment.paid_at && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Pago em {format(parseISO(payment.paid_at), "dd/MM/yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {payment.status === "eligible" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenConfirm(payment)}
                              className="gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Marcar como Pago
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Aguardando relatório
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Confirmar Pagamento
            </DialogTitle>
            <DialogDescription>
              Confirme que o pagamento foi realizado
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bolsista</span>
                  <span className="font-medium">{selectedPayment.scholar_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projeto</span>
                  <span className="font-medium">{selectedPayment.project_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referência</span>
                  <span className="font-medium">{formatReferenceMonth(selectedPayment.reference_month)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Valor</span>
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Esta ação irá registrar o pagamento como realizado e ficará disponível para o bolsista.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
