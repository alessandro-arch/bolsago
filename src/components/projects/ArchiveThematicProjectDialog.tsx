import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Archive, AlertTriangle } from 'lucide-react';
import type { ThematicProjectWithKPIs } from './ThematicProjectCard';

interface ArchiveThematicProjectDialogProps {
  project: ThematicProjectWithKPIs | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ArchiveThematicProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ArchiveThematicProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const CONFIRM_WORD = 'ARQUIVAR';
  const isConfirmValid = confirmWord.toUpperCase() === CONFIRM_WORD;

  const handleArchive = async () => {
    if (!user || !project || !isConfirmValid) return;

    setIsLoading(true);

    try {
      // Archive the thematic project
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Also archive all subprojects
      const { error: subprojectsError } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('parent_project_id', project.id);

      if (subprojectsError) throw subprojectsError;

      // Log audit via RPC
      await supabase.rpc('insert_audit_log', {
        p_action: 'ARCHIVE_THEMATIC_PROJECT',
        p_entity_type: 'project',
        p_entity_id: project.id,
        p_details: {
          project_code: project.code,
          project_title: project.title,
          subprojects_archived: project.subprojects_count,
        },
        p_previous_value: { status: 'active' },
        p_new_value: { status: 'archived' },
      });

      toast({
        title: 'Projeto arquivado',
        description: `O projeto temático "${project.code}" e seus ${project.subprojects_count} subprojeto(s) foram arquivados.`,
      });

      setConfirmWord('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error archiving thematic project:', error);
      toast({
        title: 'Erro ao arquivar projeto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmWord('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Arquivar Projeto Temático
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Você está prestes a arquivar o projeto temático <strong>{project?.code}</strong>.
            </p>
            <p>
              Esta ação irá também arquivar <strong>{project?.subprojects_count ?? 0} subprojeto(s)</strong> vinculados a este projeto.
            </p>
            <p className="text-destructive font-medium">
              Os dados não serão excluídos, mas não poderão ser editados após o arquivamento.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirm-word">
            Digite <strong>ARQUIVAR</strong> para confirmar:
          </Label>
          <Input
            id="confirm-word"
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            placeholder="ARQUIVAR"
            className="font-mono"
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Archive className="h-4 w-4 mr-2" />
            Arquivar Projeto
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
