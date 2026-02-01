import { useState, useMemo } from "react";
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckSquare, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ReportStatus = "pending" | "submitted" | "approved" | "rejected";
type PaymentStatus = "released" | "blocked" | "processing" | "paid";

interface Scholar {
  id: string;
  name: string;
  project: string;
  scholarshipType: string;
  currentMonth: string;
  reportStatus: ReportStatus;
  paymentStatus: PaymentStatus;
  projectProgress: number;
}

// Empty array - data will be loaded from backend or imported via spreadsheet
const initialScholars: Scholar[] = [];

const projects = ["Todos", "IA Aplicada à Saúde", "Robótica Educacional", "Sustentabilidade Urbana", "Direito Digital"];
const scholarshipTypes = ["Todos", "Iniciação Científica", "Extensão", "Monitoria", "Pesquisa", "Assistência Estudantil"];
const reportStatuses = ["Todos", "Pendente", "Enviado", "Aprovado", "Rejeitado"];
const paymentStatuses = ["Todos", "Liberado", "Bloqueado", "Processando", "Pago"];

const reportStatusConfig: Record<ReportStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
  submitted: { label: "Enviado", className: "bg-info/10 text-info" },
  approved: { label: "Aprovado", className: "bg-success/10 text-success" },
  rejected: { label: "Rejeitado", className: "bg-destructive/10 text-destructive" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  released: { label: "Liberado", className: "bg-success/10 text-success" },
  blocked: { label: "Bloqueado", className: "bg-destructive/10 text-destructive" },
  processing: { label: "Processando", className: "bg-info/10 text-info" },
  paid: { label: "Pago", className: "bg-primary/10 text-primary" },
};

function StatusBadge({ status, config }: { status: string; config: { label: string; className: string } }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            value >= 75 ? "bg-success" : value >= 50 ? "bg-info" : value >= 25 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-9">{value}%</span>
    </div>
  );
}

export function ScholarsTableFiltered() {
  const [scholars, setScholars] = useState<Scholar[]>(initialScholars);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [reportFilter, setReportFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scholarToDelete, setScholarToDelete] = useState<Scholar | null>(null);

  const filteredScholars = useMemo(() => {
    return scholars.filter((scholar) => {
      const matchesSearch = scholar.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === "Todos" || scholar.project === projectFilter;
      const matchesType = typeFilter === "Todos" || scholar.scholarshipType === typeFilter;
      const matchesReport = reportFilter === "Todos" || reportStatusConfig[scholar.reportStatus].label === reportFilter;
      const matchesPayment = paymentFilter === "Todos" || paymentStatusConfig[scholar.paymentStatus].label === paymentFilter;
      
      return matchesSearch && matchesProject && matchesType && matchesReport && matchesPayment;
    });
  }, [scholars, searchTerm, projectFilter, typeFilter, reportFilter, paymentFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setProjectFilter("Todos");
    setTypeFilter("Todos");
    setReportFilter("Todos");
    setPaymentFilter("Todos");
  };

  const hasActiveFilters = searchTerm || projectFilter !== "Todos" || typeFilter !== "Todos" || reportFilter !== "Todos" || paymentFilter !== "Todos";

  // Selection logic
  const allFilteredSelected = filteredScholars.length > 0 && filteredScholars.every(s => selectedIds.has(s.id));
  const someFilteredSelected = filteredScholars.some(s => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      const newSelected = new Set(selectedIds);
      filteredScholars.forEach(s => newSelected.delete(s.id));
      setSelectedIds(newSelected);
    } else {
      // Select all filtered
      const newSelected = new Set(selectedIds);
      filteredScholars.forEach(s => newSelected.add(s.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Delete logic
  const handleDeleteSingle = (scholar: Scholar) => {
    setScholarToDelete(scholar);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    setScholarToDelete(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scholarToDelete) {
      // Delete single
      setScholars(prev => prev.filter(s => s.id !== scholarToDelete.id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(scholarToDelete.id);
        return newSet;
      });
      toast.success(`Bolsista "${scholarToDelete.name}" removido com sucesso.`);
    } else {
      // Delete selected
      const count = selectedIds.size;
      setScholars(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      toast.success(`${count} bolsista(s) removido(s) com sucesso.`);
    }
    setDeleteDialogOpen(false);
    setScholarToDelete(null);
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="card-institutional overflow-hidden p-0">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Bolsistas</h3>
            <p className="text-sm text-muted-foreground">
              {filteredScholars.length} de {scholars.length} bolsistas
              {selectedCount > 0 && (
                <span className="ml-2 text-primary font-medium">
                  • {selectedCount} selecionado(s)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="w-4 h-4" />
                Excluir ({selectedCount})
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {projects.map((project) => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de bolsa" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {scholarshipTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={reportFilter} onValueChange={setReportFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status relatório" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {reportStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status pagamento" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {paymentStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-institutional">
          <thead>
            <tr>
              <th className="w-12">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title={allFilteredSelected ? "Desmarcar todos" : "Selecionar todos"}
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : someFilteredSelected ? (
                    <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                      <div className="w-2.5 h-0.5 bg-primary" />
                    </div>
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </th>
              <th>Nome</th>
              <th>Projeto</th>
              <th>Tipo de Bolsa</th>
              <th>Mês Atual</th>
              <th>Status Relatório</th>
              <th>Status Pagamento</th>
              <th>Avanço do Projeto</th>
              <th className="w-12">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredScholars.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum bolsista encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredScholars.map((scholar) => {
                const isSelected = selectedIds.has(scholar.id);
                return (
                  <tr 
                    key={scholar.id}
                    className={cn(isSelected && "bg-primary/5")}
                  >
                    <td>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOne(scholar.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {scholar.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{scholar.name}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{scholar.project}</td>
                    <td className="text-muted-foreground">{scholar.scholarshipType}</td>
                    <td className="text-muted-foreground">{scholar.currentMonth}</td>
                    <td>
                      <StatusBadge status={scholar.reportStatus} config={reportStatusConfig[scholar.reportStatus]} />
                    </td>
                    <td>
                      <StatusBadge status={scholar.paymentStatus} config={paymentStatusConfig[scholar.paymentStatus]} />
                    </td>
                    <td className="min-w-[140px]">
                      <ProgressBar value={scholar.projectProgress} />
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeleteSingle(scholar)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {scholarToDelete ? (
                <>
                  Tem certeza que deseja excluir o bolsista <strong>{scholarToDelete.name}</strong>?
                  Esta ação não pode ser desfeita.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir <strong>{selectedCount} bolsista(s)</strong> selecionado(s)?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
