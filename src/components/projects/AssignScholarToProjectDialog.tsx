import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import type { Database } from '@/integrations/supabase/types';

type GrantModality = Database['public']['Enums']['grant_modality'];

interface Project {
  id: string;
  code: string;
  title: string;
  modalidade_bolsa: string | null;
  valor_mensal: number;
  start_date: string;
  end_date: string;
}

interface Scholar {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface AssignScholarToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSuccess: () => void;
}

const MODALITY_MAP: Record<string, GrantModality> = {
  'ict': 'ict',
  'ext': 'ext',
  'ens': 'ens',
  'ino': 'ino',
  'dct_a': 'dct_a',
  'dct_b': 'dct_b',
  'dct_c': 'dct_c',
  'postdoc': 'postdoc',
  'senior': 'senior',
  'prod': 'prod',
  'visitor': 'visitor',
};

export function AssignScholarToProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: AssignScholarToProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [selectedScholarId, setSelectedScholarId] = useState('');
  const [startDate, setStartDate] = useState(project.start_date);
  const [endDate, setEndDate] = useState(project.end_date);
  const { logAction } = useAuditLog();

  // Fetch available scholars (those without active enrollment in this project)
  useEffect(() => {
    async function fetchScholars() {
      setLoadingScholars(true);
      try {
        // Get all scholars
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('is_active', true);

        if (profilesError) throw profilesError;

        // Get scholars with scholar role
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'scholar');

        if (rolesError) throw rolesError;

        const scholarUserIds = new Set(roles?.map(r => r.user_id) || []);

        // Get existing enrollments for this project
        const { data: existingEnrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('project_id', project.id)
          .eq('status', 'active');

        if (enrollmentsError) throw enrollmentsError;

        const enrolledUserIds = new Set(existingEnrollments?.map(e => e.user_id) || []);

        // Filter to scholars not already enrolled in this project
        const availableScholars = (profiles || []).filter(
          p => scholarUserIds.has(p.user_id) && !enrolledUserIds.has(p.user_id)
        );

        setScholars(availableScholars);
      } catch (error) {
        console.error('Error fetching scholars:', error);
        toast.error('Erro ao carregar bolsistas');
      } finally {
        setLoadingScholars(false);
      }
    }

    if (open) {
      fetchScholars();
      setSelectedScholarId('');
      setStartDate(project.start_date);
      setEndDate(project.end_date);
    }
  }, [open, project.id, project.start_date, project.end_date]);

  const calculateInstallments = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end > start) {
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      }
    }
    return 1;
  };

  const handleSubmit = async () => {
    if (!selectedScholarId) {
      toast.error('Selecione um bolsista');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('A data de término deve ser posterior à data de início');
      return;
    }

    setLoading(true);
    try {
      const totalInstallments = calculateInstallments();
      const modality = MODALITY_MAP[project.modalidade_bolsa || ''] || 'ict';

      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: selectedScholarId,
          project_id: project.id,
          modality,
          grant_value: project.valor_mensal,
          start_date: startDate,
          end_date: endDate,
          total_installments: totalInstallments,
          status: 'active',
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Create first payment (auto-eligible)
      const startMonth = new Date(startDate);
      const referenceMonth = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}`;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: selectedScholarId,
          enrollment_id: enrollment.id,
          installment_number: 1,
          reference_month: referenceMonth,
          amount: project.valor_mensal,
          status: 'eligible',
        });

      if (paymentError) throw paymentError;

      // Log audit
      await logAction({
        action: 'assign_scholar_to_project',
        entityType: 'enrollment',
        entityId: enrollment.id,
        newValue: {
          project_id: project.id,
          project_code: project.code,
          user_id: selectedScholarId,
          modality,
          grant_value: project.valor_mensal,
        },
      });

      const selectedScholar = scholars.find(s => s.user_id === selectedScholarId);
      toast.success(`Bolsista ${selectedScholar?.full_name || ''} vinculado com sucesso!`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error assigning scholar:', error);
      toast.error('Erro ao vincular bolsista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Atribuir Bolsista</DialogTitle>
              <DialogDescription>
                Vincular bolsista ao subprojeto {project.code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Info */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-sm font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">
              Valor mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.valor_mensal)}
            </p>
          </div>

          {/* Scholar Selection */}
          <div className="space-y-2">
            <Label>Bolsista *</Label>
            {loadingScholars ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando bolsistas...
              </div>
            ) : scholars.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum bolsista disponível para atribuição
                </p>
              </div>
            ) : (
              <Select value={selectedScholarId} onValueChange={setSelectedScholarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um bolsista" />
                </SelectTrigger>
                <SelectContent>
                  {scholars.map((scholar) => (
                    <SelectItem key={scholar.user_id} value={scholar.user_id}>
                      <span className="font-medium">{scholar.full_name || 'Sem nome'}</span>
                      {scholar.email && (
                        <span className="text-muted-foreground ml-2">({scholar.email})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Término *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Total de parcelas: {calculateInstallments()}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || scholars.length === 0}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Vínculo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
