import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Landmark, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  FileCheck,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Database } from '@/integrations/supabase/types';

type BankValidationStatus = 'pending' | 'under_review' | 'validated' | 'returned';

interface BankAccountWithProfile {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  agency: string;
  account_number: string;
  account_type: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  validation_status: BankValidationStatus;
  locked_for_edit: boolean;
  validated_by: string | null;
  validated_at: string | null;
  notes_gestor: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    cpf: string | null;
  } | null;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    variant: 'outline' as const,
    icon: Clock,
    color: 'text-muted-foreground',
  },
  under_review: {
    label: 'Em Análise',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-info',
  },
  validated: {
    label: 'Validado',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-success',
  },
  returned: {
    label: 'Devolvido',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-destructive',
  },
};

export function BankDataManagement() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<BankAccountWithProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [gestorNotes, setGestorNotes] = useState('');

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts-management'],
    queryFn: async () => {
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (accountsError) throw accountsError;

      const userIds = accounts?.map(a => a.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, cpf')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      return accounts?.map(account => ({
        ...account,
        profile: profileMap.get(account.user_id) || null,
      })) as BankAccountWithProfile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      accountId, 
      newStatus, 
      notes 
    }: { 
      accountId: string; 
      newStatus: BankValidationStatus; 
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        validation_status: newStatus,
        notes_gestor: notes || null,
      };

      // Set locked_for_edit based on status
      if (newStatus === 'under_review' || newStatus === 'validated') {
        updateData.locked_for_edit = true;
      } else if (newStatus === 'returned') {
        updateData.locked_for_edit = false;
      }

      // Set validation metadata when validated
      if (newStatus === 'validated') {
        updateData.validated_by = user?.id;
        updateData.validated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bank_accounts')
        .update(updateData)
        .eq('id', accountId);

      if (error) throw error;

      return { accountId, newStatus, notes };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts-management'] });
      
      // Log the action
      const actionMap: Record<string, 'bank_data_under_review' | 'bank_data_validated' | 'bank_data_returned'> = {
        under_review: 'bank_data_under_review',
        validated: 'bank_data_validated',
        returned: 'bank_data_returned',
      };
      
      const auditAction = actionMap[data.newStatus];
      if (auditAction) {
        await logAction({
          action: auditAction,
          entityType: 'bank_account',
          entityId: data.accountId,
          details: { notes: data.notes },
        });
      }

      const messages = {
        under_review: 'Dados em análise. Edição bloqueada para o bolsista.',
        validated: 'Dados bancários validados com sucesso.',
        returned: 'Dados devolvidos. Bolsista poderá corrigir.',
      };

      toast({
        title: 'Status atualizado',
        description: messages[data.newStatus as keyof typeof messages] || 'Status atualizado com sucesso.',
      });

      setIsDetailOpen(false);
      setSelectedAccount(null);
      setGestorNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
      console.error('Error updating status:', error);
    },
  });

  const filteredAccounts = bankAccounts?.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      account.profile?.full_name?.toLowerCase().includes(searchLower) ||
      account.profile?.email?.toLowerCase().includes(searchLower) ||
      account.profile?.cpf?.includes(searchLower) ||
      account.bank_name.toLowerCase().includes(searchLower)
    );
    
    const matchesStatus = statusFilter === 'all' || account.validation_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskValue = (value: string, revealed: boolean) => {
    if (revealed) return value;
    if (value.length <= 4) return '****';
    return value.slice(0, 2) + '****' + value.slice(-2);
  };

  const maskCPF = (cpf: string | null, revealed: boolean) => {
    if (!cpf) return '—';
    if (revealed) return cpf;
    return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.***-**');
  };

  const getAccountTypeLabel = (type: string | null) => {
    switch (type) {
      case 'checking': return 'Corrente';
      case 'savings': return 'Poupança';
      case 'Conta Corrente': return 'Corrente';
      case 'Conta Poupança': return 'Poupança';
      default: return type || '—';
    }
  };

  const openDetails = (account: BankAccountWithProfile) => {
    setSelectedAccount(account);
    setGestorNotes(account.notes_gestor || '');
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus: BankValidationStatus) => {
    if (!selectedAccount) return;
    
    if (newStatus === 'returned' && !gestorNotes.trim()) {
      toast({
        title: 'Observação obrigatória',
        description: 'Informe o motivo da devolução.',
        variant: 'destructive',
      });
      return;
    }

    updateStatusMutation.mutate({
      accountId: selectedAccount.id,
      newStatus,
      notes: gestorNotes,
    });
  };

  const statusCounts = bankAccounts?.reduce((acc, account) => {
    acc[account.validation_status] = (acc[account.validation_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Gestão de Dados Bancários
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os dados bancários de todos os bolsistas e valide informações para liberação de pagamentos.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {statusCounts.pending || 0} pendentes
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3 text-info" />
                {statusCounts.under_review || 0} em análise
              </Badge>
              <Badge className="gap-1 bg-success">
                <CheckCircle className="h-3 w-3" />
                {statusCounts.validated || 0} validados
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail, CPF ou banco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under_review">Em Análise</SelectItem>
                <SelectItem value="validated">Validado</SelectItem>
                <SelectItem value="returned">Devolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info alert */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              Dados sensíveis são mascarados por padrão. Clique no ícone de olho para revelar ou em "Detalhes" para visualizar e validar.
            </span>
          </div>

          {/* Table */}
          <ScrollArea className="h-[400px] rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Bolsista</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAccounts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum dado bancário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts?.map((account) => {
                    const isRevealed = revealedIds.has(account.id);
                    const statusConfig = STATUS_CONFIG[account.validation_status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {account.profile?.full_name || 'Nome não informado'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {account.profile?.email || '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {maskCPF(account.profile?.cpf || null, isRevealed)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{account.bank_name}</span>
                        </TableCell>
                        <TableCell className="font-mono">
                          {maskValue(account.agency, isRevealed)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {maskValue(account.account_number, isRevealed)}
                        </TableCell>
                        <TableCell>
                          {account.pix_key ? (
                            <span className="font-mono text-sm">
                              {maskValue(account.pix_key, isRevealed)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleReveal(account.id)}
                                  >
                                    {isRevealed ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isRevealed ? 'Ocultar dados' : 'Revelar dados'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetails(account)}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground pt-2">
            <span>{filteredAccounts?.length ?? 0} registro(s) encontrado(s)</span>
          </div>
        </CardContent>
      </Card>

      {/* Detail/Validation Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Validação de Dados Bancários
            </DialogTitle>
            <DialogDescription>
              Revise os dados bancários do bolsista e tome uma ação.
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              {/* Scholar Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-semibold text-sm">Dados do Bolsista</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedAccount.profile?.full_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">E-mail:</span>
                    <p className="font-medium">{selectedAccount.profile?.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <p className="font-mono">{selectedAccount.profile?.cpf || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Data */}
              <div className="p-4 rounded-lg border space-y-2">
                <h4 className="font-semibold text-sm">Dados Bancários</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Banco:</span>
                    <p className="font-medium">{selectedAccount.bank_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{getAccountTypeLabel(selectedAccount.account_type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agência:</span>
                    <p className="font-mono">{selectedAccount.agency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conta:</span>
                    <p className="font-mono">{selectedAccount.account_number}</p>
                  </div>
                  {selectedAccount.pix_key && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Chave PIX:</span>
                      <p className="font-mono">{selectedAccount.pix_key}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Status atual: <Badge variant={STATUS_CONFIG[selectedAccount.validation_status].variant}>
                    {STATUS_CONFIG[selectedAccount.validation_status].label}
                  </Badge>
                  {selectedAccount.locked_for_edit && (
                    <span className="ml-2 text-muted-foreground">(Edição bloqueada)</span>
                  )}
                </span>
              </div>

              {/* Gestor Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Observações do Gestor
                  {selectedAccount.validation_status !== 'validated' && (
                    <span className="text-muted-foreground font-normal"> (obrigatório para devolver)</span>
                  )}
                </label>
                <Textarea
                  placeholder="Informe observações ou motivo de devolução..."
                  value={gestorNotes}
                  onChange={(e) => setGestorNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedAccount?.validation_status !== 'under_review' && (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('under_review')}
                disabled={updateStatusMutation.isPending}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Colocar em Análise
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => handleStatusChange('returned')}
              disabled={updateStatusMutation.isPending}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              Devolver para Correção
            </Button>
            
            <Button
              onClick={() => handleStatusChange('validated')}
              disabled={updateStatusMutation.isPending}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
