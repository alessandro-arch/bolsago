import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, FolderOpen } from 'lucide-react';
import type { ThematicProjectWithKPIs } from './ThematicProjectCard';

const formSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  empresa_parceira: z.string().min(1, 'Financiador é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de término é obrigatória'),
  observacoes: z.string().optional(),
}).refine(data => new Date(data.start_date) < new Date(data.end_date), {
  message: 'Data de início deve ser anterior à data de término',
  path: ['end_date'],
});

type FormValues = z.infer<typeof formSchema>;

interface EditThematicProjectDialogProps {
  project: ThematicProjectWithKPIs | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditThematicProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditThematicProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      title: '',
      empresa_parceira: '',
      start_date: '',
      end_date: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (open && project) {
      form.reset({
        code: project.code,
        title: project.title,
        empresa_parceira: project.empresa_parceira,
        start_date: project.start_date,
        end_date: project.end_date,
        observacoes: project.observacoes || '',
      });
    }
  }, [open, project, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user || !project) return;

    setIsLoading(true);

    try {
      const previousValue = {
        code: project.code,
        title: project.title,
        empresa_parceira: project.empresa_parceira,
        start_date: project.start_date,
        end_date: project.end_date,
        observacoes: project.observacoes,
      };

      const newValue = {
        code: values.code,
        title: values.title,
        empresa_parceira: values.empresa_parceira,
        start_date: values.start_date,
        end_date: values.end_date,
        observacoes: values.observacoes || null,
      };

      const { error: updateError } = await supabase
        .from('projects')
        .update(newValue)
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Log audit via RPC
      await supabase.rpc('insert_audit_log', {
        p_action: 'UPDATE_THEMATIC_PROJECT',
        p_entity_type: 'project',
        p_entity_id: project.id,
        p_details: {
          project_code: values.code,
          changes: Object.keys(newValue).filter(
            key => JSON.stringify(previousValue[key as keyof typeof previousValue]) !== 
                   JSON.stringify(newValue[key as keyof typeof newValue])
          ),
        },
        p_previous_value: previousValue,
        p_new_value: newValue,
      });

      toast({
        title: 'Projeto Temático atualizado',
        description: `O projeto "${values.title}" foi atualizado com sucesso.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating thematic project:', error);
      toast({
        title: 'Erro ao atualizar projeto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Editar Projeto Temático
          </DialogTitle>
          <DialogDescription>
            Altere os dados do projeto temático mestre.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: PT-2026-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Projeto *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descrição completa do projeto temático"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresa_parceira"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financiador *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do financiador do projeto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Observações adicionais (opcional)"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
