import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FolderOpen, 
  Plus, 
  Download,
} from 'lucide-react';
import { ThematicProjectCard, type ThematicProjectWithKPIs } from '@/components/projects/ThematicProjectCard';
import { CreateThematicProjectDialog } from '@/components/projects/CreateThematicProjectDialog';
import { EditThematicProjectDialog } from '@/components/projects/EditThematicProjectDialog';
import { ArchiveThematicProjectDialog } from '@/components/projects/ArchiveThematicProjectDialog';
import { useThematicProjects, useFinanciadores } from '@/hooks/useThematicProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'active' | 'inactive' | 'archived';

export default function ThematicProjects() {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [financiadorFilter, setFinanciadorFilter] = useState('all');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ThematicProjectWithKPIs | null>(null);

  const { data: projects, isLoading, refetch } = useThematicProjects({
    statusFilter,
    searchTerm,
    financiadorFilter: financiadorFilter === 'all' ? '' : financiadorFilter,
  });

  const { data: financiadores } = useFinanciadores();

  const handleViewProject = (project: ThematicProjectWithKPIs) => {
    // Navigate to project detail page (to be implemented)
    navigate(`/projetos-tematicos/${project.id}`);
  };

  const handleEditProject = (project: ThematicProjectWithKPIs) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleArchiveProject = (project: ThematicProjectWithKPIs) => {
    setSelectedProject(project);
    setArchiveDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    refetch();
  };

  const handleExport = () => {
    if (!projects?.length) return;
    
    const headers = ['Código', 'Título', 'Financiador', 'Início', 'Término', 'Status', 'Subprojetos', 'Bolsistas', 'Valor Mensal'];
    const rows = projects.map(p => [
      p.code,
      p.title,
      p.empresa_parceira,
      p.start_date,
      p.end_date,
      p.status === 'active' ? 'Ativo' : p.status === 'inactive' ? 'Encerrado' : 'Arquivado',
      p.subprojects_count.toString(),
      p.active_scholars_count.toString(),
      p.total_monthly_value.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projetos-tematicos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const stats = {
    total: projects?.length ?? 0,
    active: projects?.filter(p => p.status === 'active').length ?? 0,
    totalScholars: projects?.reduce((sum, p) => sum + p.active_scholars_count, 0) ?? 0,
    totalValue: projects?.reduce((sum, p) => sum + p.total_monthly_value, 0) ?? 0,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <AdminBanner />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-primary" />
                  Projetos Temáticos
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestão estratégica dos projetos institucionais do ICCA
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={!projects?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto Temático
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Encerrados</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={financiadorFilter}
                onValueChange={setFinanciadorFilter}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Financiador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os financiadores</SelectItem>
                  {financiadores?.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats Summary */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-4">
              <span><strong>{stats.total}</strong> projeto(s) encontrado(s)</span>
              <span>•</span>
              <span><strong>{stats.active}</strong> ativo(s)</span>
              <span>•</span>
              <span><strong>{stats.totalScholars}</strong> bolsista(s) ativos</span>
              <span>•</span>
              <span><strong>{formatCurrency(stats.totalValue)}</strong> /mês total</span>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-12 w-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Projeto Temático</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' || financiadorFilter !== 'all'
                      ? 'Nenhum projeto encontrado com os filtros selecionados.'
                      : 'Crie o primeiro projeto temático para começar a gerenciar subprojetos e bolsistas.'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && financiadorFilter === 'all' && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Projeto Temático
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <ThematicProjectCard
                    key={project.id}
                    project={project}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onArchive={handleArchiveProject}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Footer />

      {/* Dialogs */}
      <CreateThematicProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleProjectUpdated}
      />

      <EditThematicProjectDialog
        project={selectedProject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleProjectUpdated}
      />

      <ArchiveThematicProjectDialog
        project={selectedProject}
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onSuccess={handleProjectUpdated}
      />
    </div>
  );
}
