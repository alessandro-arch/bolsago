import { useState, useEffect } from "react";
import {
  FileSearch,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  User,
  Calendar,
  ChevronDown,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportWithDetails {
  id: string;
  user_id: string;
  reference_month: string;
  installment_number: number;
  file_url: string;
  file_name: string;
  observations: string | null;
  status: string;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  resubmission_deadline: string | null;
  scholar_name: string;
  scholar_email: string;
  project_title: string;
  project_code: string;
  enrollment_id: string;
  payment_id: string | null;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  under_review: { label: "Em Análise", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Aprovado", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Devolvido", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
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

export function ReportsReviewManagement() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [isOpen, setIsOpen] = useState(true);
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("under_review");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch reports with scholar and project details
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (reportsError) throw reportsError;

      if (!reportsData || reportsData.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(reportsData.map(r => r.user_id))];

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      // Fetch enrollments to get project info
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          project:projects(id, title, code)
        `)
        .in("user_id", userIds);

      // Fetch payments to link reports
      const { data: payments } = await supabase
        .from("payments")
        .select("id, user_id, reference_month, enrollment_id")
        .in("user_id", userIds);

      // Build enriched reports
      const enrichedReports: ReportWithDetails[] = reportsData.map(report => {
        const profile = profiles?.find(p => p.user_id === report.user_id);
        const enrollment = enrollments?.find(e => e.user_id === report.user_id);
        const payment = payments?.find(p => 
          p.user_id === report.user_id && 
          p.reference_month === report.reference_month
        );
        const project = enrollment?.project as { id: string; title: string; code: string } | null;

        return {
          ...report,
          scholar_name: profile?.full_name || "Nome não disponível",
          scholar_email: profile?.email || "",
          project_title: project?.title || "Projeto não encontrado",
          project_code: project?.code || "",
          enrollment_id: enrollment?.id || "",
          payment_id: payment?.id || null,
        };
      });

      setReports(enrichedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesSearch = 
      searchTerm === "" ||
      report.scholar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reference_month.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleViewPdf = async (fileUrl: string) => {
    setPdfLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("reports")
        .createSignedUrl(fileUrl, 900); // 15 minutes

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Erro ao abrir PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleOpenReview = (report: ReportWithDetails) => {
    setSelectedReport(report);
    setFeedback("");
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedReport || !user) return;
    setSubmitting(true);

    try {
      const now = new Date().toISOString();

      // Update report status
      const { error: reportError } = await supabase
        .from("reports")
        .update({
          status: "approved",
          reviewed_at: now,
          reviewed_by: user.id,
          feedback: feedback || null,
        })
        .eq("id", selectedReport.id);

      if (reportError) throw reportError;

      // Update payment status to eligible (released)
      if (selectedReport.payment_id) {
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "eligible",
            report_id: selectedReport.id,
          })
          .eq("id", selectedReport.payment_id);

        if (paymentError) {
          console.error("Error updating payment:", paymentError);
        }
      }

      // Log audit
      await logAction({
        action: "approve_report",
        entityType: "report",
        entityId: selectedReport.id,
        details: {
          scholar_id: selectedReport.user_id,
          scholar_name: selectedReport.scholar_name,
          reference_month: selectedReport.reference_month,
          feedback: feedback || null,
        },
      });

      toast.success("Relatório aprovado com sucesso!");
      setReviewDialogOpen(false);
      fetchReports();
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error("Erro ao aprovar relatório");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport || !user) return;
    
    if (!feedback.trim()) {
      toast.error("O parecer é obrigatório para devolução");
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date();
      const deadline = addDays(now, 5);

      // Update report status
      const { error: reportError } = await supabase
        .from("reports")
        .update({
          status: "rejected",
          reviewed_at: now.toISOString(),
          reviewed_by: user.id,
          feedback: feedback,
          resubmission_deadline: deadline.toISOString(),
        })
        .eq("id", selectedReport.id);

      if (reportError) throw reportError;

      // Log audit
      await logAction({
        action: "reject_report",
        entityType: "report",
        entityId: selectedReport.id,
        details: {
          scholar_id: selectedReport.user_id,
          scholar_name: selectedReport.scholar_name,
          reference_month: selectedReport.reference_month,
          feedback: feedback,
          resubmission_deadline: deadline.toISOString(),
        },
      });

      toast.success("Relatório devolvido para correção");
      setReviewDialogOpen(false);
      fetchReports();
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Erro ao devolver relatório");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = reports.filter(r => r.status === "under_review").length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="card-institutional overflow-hidden p-0">
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">
                  Avaliação de Relatórios
                </h2>
                <p className="text-sm text-muted-foreground">
                  {pendingCount > 0 
                    ? `${pendingCount} relatório(s) aguardando análise`
                    : "Todos os relatórios foram analisados"
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
                  <SelectItem value="under_review">Em Análise</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Devolvidos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchReports}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Reports List */}
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando relatórios...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">
                    {statusFilter === "under_review" 
                      ? "Nenhum relatório pendente de análise"
                      : "Nenhum relatório encontrado"
                    }
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const config = statusConfig[report.status] || statusConfig.under_review;
                  const StatusIcon = config.icon;

                  return (
                    <div key={report.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">
                                {report.scholar_name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {report.project_code}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Referência: {formatReferenceMonth(report.reference_month)} • Parcela {report.installment_number}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                                config.className
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(parseISO(report.submitted_at), "dd/MM/yyyy HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPdf(report.file_url)}
                            disabled={pdfLoading}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver PDF
                          </Button>
                          {report.status === "under_review" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(report)}
                            >
                              <FileSearch className="w-4 h-4 mr-1" />
                              Avaliar
                            </Button>
                          )}
                        </div>
                      </div>

                      {report.feedback && (
                        <div className="mt-3 ml-13 p-3 bg-muted/50 rounded-lg text-sm">
                          <p className="font-medium text-foreground mb-1">Parecer:</p>
                          <p className="text-muted-foreground">{report.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-primary" />
              Avaliar Relatório
            </DialogTitle>
            <DialogDescription>
              Analise o relatório e emita seu parecer
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedReport.scholar_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedReport.project_code} • {formatReferenceMonth(selectedReport.reference_month)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleViewPdf(selectedReport.file_url)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar PDF
                </Button>
              </div>

              {selectedReport.observations && (
                <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
                  <p className="text-sm font-medium text-info mb-1">Observações do bolsista:</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.observations}</p>
                </div>
              )}

              {/* Feedback */}
              <div>
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Parecer <span className="text-muted-foreground">(obrigatório para devolução)</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Adicione seu parecer sobre o relatório..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2 resize-none"
                  rows={4}
                />
              </div>

              {/* Warning for rejection */}
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Ao devolver o relatório, o bolsista terá <strong>5 dias</strong> para reenviar uma versão corrigida.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setReviewDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting || !feedback.trim()}
              className="gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Devolver
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
