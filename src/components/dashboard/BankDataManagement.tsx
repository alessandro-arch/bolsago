import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Landmark, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    cpf: string | null;
  } | null;
}

export function BankDataManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts-management'],
    queryFn: async () => {
      // Fetch bank accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Fetch profiles for all user_ids
      const userIds = accounts?.map(a => a.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, cpf')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles to accounts
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      return accounts?.map(account => ({
        ...account,
        profile: profileMap.get(account.user_id) || null,
      })) as BankAccountWithProfile[];
    },
  });

  const filteredAccounts = bankAccounts?.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.profile?.full_name?.toLowerCase().includes(searchLower) ||
      account.profile?.email?.toLowerCase().includes(searchLower) ||
      account.bank_name.toLowerCase().includes(searchLower) ||
      account.bank_code.includes(searchLower)
    );
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
      default: return type || '—';
    }
  };

  const getPixKeyTypeLabel = (type: string | null) => {
    switch (type) {
      case 'cpf': return 'CPF';
      case 'email': return 'E-mail';
      case 'phone': return 'Telefone';
      case 'random': return 'Aleatória';
      default: return type || '—';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Gestão de Dados Bancários
            </CardTitle>
            <CardDescription>
              Visualize e gerencie os dados bancários de todos os bolsistas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              {bankAccounts?.length || 0} cadastrados
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou banco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Alert about sensitive data */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Dados sensíveis são mascarados por padrão. Clique no ícone de olho para revelar.
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
                <TableHead>Tipo</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{account.bank_name}</span>
                          <span className="text-xs text-muted-foreground">
                            Cód. {account.bank_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {maskValue(account.agency, isRevealed)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {maskValue(account.account_number, isRevealed)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAccountTypeLabel(account.account_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {account.pix_key ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col">
                                  <span className="font-mono text-sm">
                                    {maskValue(account.pix_key, isRevealed)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {getPixKeyTypeLabel(account.pix_key_type)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isRevealed ? account.pix_key : 'Clique em revelar para ver'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleReveal(account.id)}
                          title={isRevealed ? 'Ocultar dados' : 'Revelar dados'}
                        >
                          {isRevealed ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
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
  );
}
