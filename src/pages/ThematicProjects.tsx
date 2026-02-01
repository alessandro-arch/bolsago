import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AdminBanner } from '@/components/admin/AdminBanner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FolderOpen, 
  Plus, 
  Eye, 
  Edit, 
  Archive, 
  Trash2,
  Download 
} from 'lucide-react';
import { ProjectDetailsDialog } from '@/components/projects/ProjectDetailsDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { ArchiveProjectDialog } from '@/components/projects/ArchiveProjectDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

interface Project {
  id: string;
  code: string;
  title: string;
  empresa_parceira: string;
  modalidade_bolsa: string | null;
  valor_mensal: number;
  start_date: string;
  end_date: string;
  coordenador_tecnico_icca: string | null;
  observacoes?: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'active' | 'archived';

export default function ThematicProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectHasDependencies, setProjectHasDependencies] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['thematic-projects', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter === 'active') {
        query = query.eq('status', 'active');
      } else if (statusFilter === 'archived') {
        query = query.eq('status', 'archived');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Project[];
    },
  });

  const filteredProjects = projects?.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.code.toLowerCase().includes(searchLower) ||
      project.title.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleArchiveProject = (project: Project) => {
    setSelectedProject(project);
    setArchiveDialogOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {
    // Check for dependencies before opening delete dialog
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);

    const hasDeps = (enrollmentCount ?? 0) > 0;
    setProjectHasDependencies(hasDeps);
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    refetch();
  };

  const handleExport = () => {
    if (!filteredProjects?.length) return;
    
    const headers = ['Código', 'Título', 'Empresa Parceira', 'Modalidade', 'Valor Mensal', 'Início', 'Término', 'Status'];
    const rows = filteredProjects.map(p => [
      p.code,
      p.title,
      p.empresa_parceira,
      p.modalidade_bolsa || '',
      p.valor_mensal.toString(),
      p.start_date,
      p.end_date,
      p.status
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <AdminBanner />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-primary" />
                  Projetos Temáticos
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie os projetos temáticos do ICCA Bolsa Conecta
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={!filteredProjects?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>
            </div>

            {/* Main Card */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Projetos</CardTitle>
                <CardDescription>
                  Visualize, edite e gerencie todos os projetos temáticos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou título..."
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
                      <SelectItem value="archived">Arquivados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{filteredProjects?.length ?? 0} projeto(s) encontrado(s)</span>
                  {projects && (
                    <>
                      <span>•</span>
                      <span>{projects.filter(p => p.status === 'active').length} ativo(s)</span>
                      <span>•</span>
                      <span>{projects.filter(p => p.status === 'archived').length} arquivado(s)</span>
                    </>
                  )}
                </div>

                {/* Table */}
                <ScrollArea className="h-[500px] rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[120px]">Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Empresa Parceira</TableHead>
                        <TableHead>Modalidade</TableHead>
                        <TableHead className="text-right">Valor Mensal</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[140px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredProjects?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nenhum projeto encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjects?.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-mono text-sm">{project.code}</TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate" title={project.title}>
                              {project.title}
                            </TableCell>
                            <TableCell>{project.empresa_parceira}</TableCell>
                            <TableCell>{project.modalidade_bolsa || '—'}</TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(project.valor_mensal)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(project.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(project.end_date), 'dd/MM/yy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewProject(project)}
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProject(project)}
                                  title="Editar"
                                  disabled={project.status === 'archived'}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {project.status === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleArchiveProject(project)}
                                    title="Arquivar"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProject(project)}
                                  title="Excluir"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <Footer />

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleProjectUpdated}
      />

      {selectedProject && (
        <>
          <ProjectDetailsDialog
            project={selectedProject}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            onClose={() => {
              setDetailsDialogOpen(false);
              setSelectedProject(null);
            }}
            onProjectUpdated={handleProjectUpdated}
          />

          <EditProjectDialog
            project={selectedProject}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleProjectUpdated}
          />

          <ArchiveProjectDialog
            project={selectedProject}
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
            onSuccess={handleProjectUpdated}
          />

          <DeleteProjectDialog
            project={selectedProject}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleProjectUpdated}
            hasDependencies={projectHasDependencies}
          />
        </>
      )}
    </div>
  );
}
