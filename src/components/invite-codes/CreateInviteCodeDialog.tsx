import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Copy, Loader2, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  code: string;
  empresa_parceira: string;
}

interface CreateInviteCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSuccess: () => void;
}

export function CreateInviteCodeDialog({
  open,
  onOpenChange,
  projects,
  onSuccess,
}: CreateInviteCodeDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('5');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>();

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const resetForm = () => {
    setSelectedProjectId('');
    setMaxUses('5');
    setHasExpiration(false);
    setExpirationDate(undefined);
    setGeneratedCode(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ICCA-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async () => {
    if (!selectedProjectId || !user) {
      toast.error('Selecione um projeto temático');
      return;
    }

    setIsLoading(true);
    const code = generateCode();

    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          thematic_project_id: selectedProjectId,
          partner_company_id: selectedProjectId, // Using project ID as reference
          code,
          max_uses: maxUses === 'unlimited' ? null : parseInt(maxUses),
          expires_at: hasExpiration && expirationDate ? expirationDate.toISOString().split('T')[0] : null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase.rpc('insert_audit_log', {
        p_action: 'CREATE_INVITE_CODE',
        p_entity_type: 'invite_code',
        p_entity_id: data.id,
        p_details: {
          code,
          project_id: selectedProjectId,
          project_title: selectedProject?.title,
          max_uses: maxUses === 'unlimited' ? null : parseInt(maxUses),
          expires_at: hasExpiration && expirationDate ? expirationDate.toISOString() : null,
        },
        p_new_value: data,
      });

      setGeneratedCode(code);
      toast.success('Código gerado com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating invite code:', error);
      toast.error('Erro ao gerar código', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndClose = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Código copiado!');
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {generatedCode ? 'Código Gerado' : 'Gerar Código de Convite'}
          </DialogTitle>
          <DialogDescription>
            {generatedCode 
              ? 'O código foi gerado com sucesso. Copie e compartilhe com o bolsista.'
              : 'Crie um novo código de convite vinculado a um Projeto Temático.'
            }
          </DialogDescription>
        </DialogHeader>

        {generatedCode ? (
          <div className="py-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-lg w-full">
                <p className="text-xs text-muted-foreground text-center mb-2">Código de Convite</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-primary">
                    {generatedCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      toast.success('Código copiado!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedProject && (
                <div className="text-sm text-center text-muted-foreground">
                  <p><strong>Projeto:</strong> {selectedProject.title}</p>
                  <p><strong>Proponente:</strong> {selectedProject.empresa_parceira}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project">Projeto Temático *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="font-mono text-xs mr-2">{project.code}</span>
                      {project.title.slice(0, 40)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <p className="text-xs text-muted-foreground">
                  Proponente: {selectedProject.empresa_parceira}
                </p>
              )}
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label htmlFor="maxUses">Limite de usos</Label>
              <Select value={maxUses} onValueChange={setMaxUses}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 uso</SelectItem>
                  <SelectItem value="5">5 usos</SelectItem>
                  <SelectItem value="10">10 usos</SelectItem>
                  <SelectItem value="25">25 usos</SelectItem>
                  <SelectItem value="50">50 usos</SelectItem>
                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiration">Data de expiração</Label>
                <Switch
                  id="expiration"
                  checked={hasExpiration}
                  onCheckedChange={setHasExpiration}
                />
              </div>
              
              {hasExpiration && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expirationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate 
                        ? format(expirationDate, "PPP", { locale: ptBR })
                        : "Selecione uma data"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={setExpirationDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {generatedCode ? (
            <Button onClick={handleCopyAndClose} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar e Fechar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !selectedProjectId}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    Gerar Código
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
