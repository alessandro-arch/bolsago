import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Calendar, 
  Eye, 
  Edit, 
  Archive, 
  MoreHorizontal,
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

export interface ThematicProjectWithKPIs {
  id: string;
  code: string;
  title: string;
  empresa_parceira: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  observacoes: string | null;
  // KPIs
  subprojects_count: number;
  active_scholars_count: number;
  total_monthly_value: number;
  // Compliance
  pending_reports: number;
  late_reports: number;
}

interface ThematicProjectCardProps {
  project: ThematicProjectWithKPIs;
  onView: (project: ThematicProjectWithKPIs) => void;
  onEdit: (project: ThematicProjectWithKPIs) => void;
  onArchive: (project: ThematicProjectWithKPIs) => void;
  isAdmin: boolean;
}

export function ThematicProjectCard({ 
  project, 
  onView, 
  onEdit, 
  onArchive,
  isAdmin 
}: ThematicProjectCardProps) {
  const getStatusBadge = () => {
    switch (project.status) {
      case 'active':
        return (
          <Badge className="bg-success text-success-foreground gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </Badge>
        );
      case 'inactive':
        return <Badge variant="secondary">Encerrado</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return null;
    }
  };

  const getComplianceIndicator = () => {
    if (project.late_reports > 0) {
      return {
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        icon: AlertCircle,
        label: 'Pendências críticas',
      };
    }
    if (project.pending_reports > 0) {
      return {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        icon: AlertTriangle,
        label: 'Alertas',
      };
    }
    return {
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: CheckCircle2,
      label: 'Em dia',
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const compliance = getComplianceIndicator();
  const ComplianceIcon = compliance.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {project.code}
                </span>
                {getStatusBadge()}
              </div>
              <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2">
                {project.title}
              </h3>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Projeto
                </DropdownMenuItem>
                {isAdmin && project.status === 'active' && (
                  <DropdownMenuItem onClick={() => onArchive(project)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar Projeto
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>{project.empresa_parceira}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(project.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(project.end_date), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-foreground">{project.subprojects_count}</p>
              <p className="text-xs text-muted-foreground">Subprojetos</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-foreground">{project.active_scholars_count}</p>
              <p className="text-xs text-muted-foreground">Bolsistas ativos</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(project.total_monthly_value)}</p>
              <p className="text-xs text-muted-foreground">Valor mensal</p>
            </div>
            
            <div className={`${compliance.bgColor} rounded-lg p-3 text-center`}>
              <div className={`flex items-center justify-center gap-1 ${compliance.color} mb-1`}>
                <ComplianceIcon className="h-4 w-4" />
              </div>
              <p className={`text-sm font-semibold ${compliance.color}`}>{compliance.label}</p>
              <p className="text-xs text-muted-foreground">Conformidade</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button onClick={() => onView(project)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Projeto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
