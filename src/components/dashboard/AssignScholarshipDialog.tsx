import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, GraduationCap, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type GrantModality = Database["public"]["Enums"]["grant_modality"];

interface Project {
  id: string;
  code: string;
  title: string;
}

interface AssignScholarshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string | null;
  onSuccess: () => void;
}

const MODALITY_LABELS: Record<GrantModality, string> = {
  ict: "Bolsa de Iniciação Científica e Tecnológica",
  ext: "Bolsa de Extensão",
  ens: "Bolsa de Apoio ao Ensino",
  ino: "Bolsa de Inovação",
  dct_a: "Bolsa de Desenvolvimento Científico e Tecnológico (Nível A)",
  dct_b: "Bolsa de Desenvolvimento Científico e Tecnológico (Nível B)",
  dct_c: "Bolsa de Desenvolvimento Científico e Tecnológico (Nível C)",
  postdoc: "Bolsa de Pós-doutorado",
  senior: "Bolsa de Cientista Sênior",
  prod: "Bolsa de Produtividade em Pesquisa",
  visitor: "Bolsa de Pesquisador Visitante (Estrangeiro)",
};

export function AssignScholarshipDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: AssignScholarshipDialogProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Form state
  const [projectId, setProjectId] = useState("");
  const [modality, setModality] = useState<GrantModality | "">("");
  const [grantValue, setGrantValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [observations, setObservations] = useState("");

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, code, title")
          .order("title");

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Erro ao carregar projetos");
      } finally {
        setLoadingProjects(false);
      }
    }

    if (open) {
      fetchProjects();
    }
  }, [open]);

  // Calculate installments based on dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end > start) {
        const months = 
          (end.getFullYear() - start.getFullYear()) * 12 + 
          (end.getMonth() - start.getMonth()) + 1;
        setTotalInstallments(String(months));
      }
    }
  }, [startDate, endDate]);

  const resetForm = () => {
    setProjectId("");
    setModality("");
    setGrantValue("");
    setStartDate("");
    setEndDate("");
    setTotalInstallments("");
    setObservations("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!projectId || !modality || !grantValue || !startDate || !endDate || !totalInstallments) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const parsedValue = parseFloat(grantValue.replace(",", "."));
    if (isNaN(parsedValue) || parsedValue <= 0) {
      toast.error("Valor mensal inválido");
      return;
    }

    const parsedInstallments = parseInt(totalInstallments);
    if (isNaN(parsedInstallments) || parsedInstallments <= 0) {
      toast.error("Número de parcelas inválido");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("A data de término deve ser posterior à data de início");
      return;
    }

    setLoading(true);
    try {
      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          user_id: userId,
          project_id: projectId,
          modality: modality as GrantModality,
          grant_value: parsedValue,
          start_date: startDate,
          end_date: endDate,
          total_installments: parsedInstallments,
          observations: observations || null,
          status: "active",
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Create first payment (auto-eligible as per business rules)
      const startMonth = new Date(startDate);
      const referenceMonth = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, "0")}`;

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          enrollment_id: enrollment.id,
          installment_number: 1,
          reference_month: referenceMonth,
          amount: parsedValue,
          status: "eligible", // First installment is auto-eligible
        });

      if (paymentError) throw paymentError;

      toast.success(`Bolsa atribuída com sucesso para ${userName || "o bolsista"}`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error assigning scholarship:", error);
      toast.error("Erro ao atribuir bolsa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Atribuir Bolsa</DialogTitle>
              <DialogDescription>
                Vincular bolsa para {userName || "bolsista selecionado"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Projeto *</Label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando projetos...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Nenhum projeto cadastrado
                </p>
                <p className="text-xs text-muted-foreground">
                  Importe projetos via planilha antes de atribuir bolsas
                </p>
              </div>
            ) : (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="font-medium">{project.code}</span>
                      <span className="text-muted-foreground ml-2">- {project.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Modality Selection */}
          <div className="space-y-2">
            <Label htmlFor="modality">Modalidade *</Label>
            <Select value={modality} onValueChange={(v) => setModality(v as GrantModality)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MODALITY_LABELS) as GrantModality[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {MODALITY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grant Value */}
          <div className="space-y-2">
            <Label htmlFor="grantValue">Valor Mensal (R$) *</Label>
            <Input
              id="grantValue"
              type="text"
              placeholder="Ex: 700,00"
              value={grantValue}
              onChange={(e) => setGrantValue(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Total Installments */}
          <div className="space-y-2">
            <Label htmlFor="installments">Total de Parcelas *</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              placeholder="Calculado automaticamente"
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Calculado automaticamente com base no período da bolsa
            </p>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais (opcional)"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || projects.length === 0}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Atribuir Bolsa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
