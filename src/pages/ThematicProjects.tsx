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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Download,
  UserPlus,
  UserX,
  ChevronDown,
  FileText
} from 'lucide-react';
import { MasterProjectCard } from '@/components/projects/MasterProjectCard';
import { ProjectDetailsDialog } from '@/components/projects/ProjectDetailsDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { CreateThematicProjectDialog } from '@/components/projects/CreateThematicProjectDialog';
import { ArchiveProjectDialog } from '@/components/projects/ArchiveProjectDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { AssignScholarToProjectDialog } from '@/components/projects/AssignScholarToProjectDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

interface ThematicProjectData {
  id: string;
  code: string;
  title: string;
  empresa_parceira: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
}

interface ProjectWithScholar {
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
  parent_project_id: string | null;
  is_thematic: boolean;
  scholar_name: string | null;
  enrollment_status: string | null;
}

type StatusFilter = 'all' | 'active' | 'archived';

export default function ThematicProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedThematicId, setSelectedThematicId] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectWithScholar | null>(null);
  const [projectHasDependencies, setProjectHasDependencies] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createThematicDialogOpen, setCreateThematicDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch thematic projects (master projects)
  const { data: thematicProjects, refetch: refetchThematic } = useQuery({
    queryKey: ['thematic-projects-master'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, code, title, empresa_parceira, status, start_date, end_date')
        .eq('is_thematic', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ThematicProjectData[];
    },
  });

  // Fetch subprojects with scholar info
  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['subprojects-with-scholars', statusFilter, selectedThematicId],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('is_thematic', false)
        .order('created_at', { ascending: false });

      if (statusFilter === 'active') {
        query = query.eq('status', 'active');
      } else if (statusFilter === 'archived') {
        query = query.eq('status', 'archived');
      }

      if (selectedThematicId !== 'all') {
        query = query.eq('parent_project_id', selectedThematicId);
      }

      const { data: projectsData, error: projectsError } = await query;
      if (projectsError) throw projectsError;

      // Fetch enrollments with scholar info
      const projectIds = projectsData?.map(p => p.id) || [];
      
      if (projectIds.length === 0) {
        return [];
      }

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('project_id, user_id, status')
        .in('project_id', projectIds)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // Get unique user IDs from enrollments
      const userIds = [...new Set(enrollments?.map(e => e.user_id) || [])];
      
      let profilesMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p.full_name || 'Sem nome';
          return acc;
        }, {} as Record<string, string>);
      }

      // Map enrollments to projects
      const enrollmentMap = (enrollments || []).reduce((acc, e) => {
        if (!acc[e.project_id]) {
          acc[e.project_id] = {
            scholar_name: profilesMap[e.user_id] || null,
            enrollment_status: e.status,
          };
        }
        return acc;
      }, {} as Record<string, { scholar_name: string | null; enrollment_status: string | null }>);

      // Combine projects with scholar info
      return (projectsData || []).map(project => ({
        ...project,
        scholar_name: enrollmentMap[project.id]?.scholar_name || null,
        enrollment_status: enrollmentMap[project.id]?.enrollment_status || null,
      })) as ProjectWithScholar[];
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

  const handleViewProject = (project: ProjectWithScholar) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleEditProject = (project: ProjectWithScholar) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleArchiveProject = (project: ProjectWithScholar) => {
    setSelectedProject(project);
    setArchiveDialogOpen(true);
  };

  const handleDeleteProject = async (project: ProjectWithScholar) => {
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

  const handleAssignScholar = (project: ProjectWithScholar) => {
    setSelectedProject(project);
    setAssignDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    refetch();
    refetchThematic();
  };

  const handleExport = () => {
    if (!filteredProjects?.length) return;
    
    const headers = ['Código', 'Título', 'Bolsista', 'Modalidade', 'Valor Mensal', 'Início', 'Término', 'Status'];
    const rows = filteredProjects.map(p => [
      p.code,
      p.title,
      p.scholar_name || 'Não atribuído',
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
    link.download = `subprojetos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Convert ProjectWithScholar to the format expected by dialogs
  const selectedProjectForDialogs = selectedProject ? {
    id: selectedProject.id,
    code: selectedProject.code,
    title: selectedProject.title,
    empresa_parceira: selectedProject.empresa_parceira,
    modalidade_bolsa: selectedProject.modalidade_bolsa,
    valor_mensal: selectedProject.valor_mensal,
    start_date: selectedProject.start_date,
    end_date: selectedProject.end_date,
    coordenador_tecnico_icca: selectedProject.coordenador_tecnico_icca,
    observacoes: selectedProject.observacoes,
    status: selectedProject.status,
    created_at: selectedProject.created_at,
    updated_at: selectedProject.updated_at,
  } : null;

  // Get currently selected thematic project for display
  const activeThematicProjects = thematicProjects?.filter(p => p.status === 'active') || [];

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
                  Gerencie os projetos temáticos, subprojetos e vínculos de bolsistas
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={!filteredProjects?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => setCreateThematicDialogOpen(true)}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Projeto Temático
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Subprojeto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Thematic Projects List */}
            {activeThematicProjects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Projetos Temáticos ({activeThematicProjects.length})
                </h2>
                <div className="grid gap-3">
                  {activeThematicProjects.map((thematic) => (
                    <MasterProjectCard
                      key={thematic.id}
                      title={thematic.title}
                      financiador={thematic.empresa_parceira}
                      status={thematic.status}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeThematicProjects.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Projeto Temático</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie um projeto temático para começar a gerenciar subprojetos e bolsistas.
                  </p>
                  <Button onClick={() => setCreateThematicDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto Temático
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Subprojects Card */}
            <Card>
              <CardHeader>
                <CardTitle>Subprojetos</CardTitle>
                <CardDescription>
                  Registros operacionais de bolsas vinculados aos projetos temáticos
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
                    value={selectedThematicId}
                    onValueChange={setSelectedThematicId}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Projeto Temático" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Temáticos</SelectItem>
                      {thematicProjects?.map((thematic) => (
                        <SelectItem key={thematic.id} value={thematic.id}>
                          {thematic.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <span>{filteredProjects?.length ?? 0} subprojeto(s) encontrado(s)</span>
                  {projects && (
                    <>
                      <span>•</span>
                      <span>{projects.filter(p => p.status === 'active').length} ativo(s)</span>
                      <span>•</span>
                      <span>{projects.filter(p => p.scholar_name).length} com bolsista</span>
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
                        <TableHead>Bolsista</TableHead>
                        <TableHead>Modalidade</TableHead>
                        <TableHead className="text-right">Valor Mensal</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[180px]">Ações</TableHead>
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
                            <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredProjects?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nenhum subprojeto encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjects?.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-mono text-sm">{project.code}</TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate" title={project.title}>
                              {project.title}
                            </TableCell>
                            <TableCell>
                              {project.scholar_name ? (
                                <span className="font-medium">{project.scholar_name}</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Não atribuído</span>
                                  <Badge variant="outline" className="text-xs">
                                    <UserX className="h-3 w-3 mr-1" />
                                    Aguardando
                                  </Badge>
                                </div>
                              )}
                            </TableCell>
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
                                {!project.scholar_name && project.status === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleAssignScholar(project)}
                                    title="Atribuir Bolsista"
                                    className="text-primary hover:text-primary"
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                )}
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
      <CreateThematicProjectDialog
        open={createThematicDialogOpen}
        onOpenChange={setCreateThematicDialogOpen}
        onSuccess={handleProjectUpdated}
      />

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleProjectUpdated}
      />

      {selectedProjectForDialogs && (
        <>
          <ProjectDetailsDialog
            project={selectedProjectForDialogs}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            onClose={() => {
              setDetailsDialogOpen(false);
              setSelectedProject(null);
            }}
            onProjectUpdated={handleProjectUpdated}
          />

          <EditProjectDialog
            project={selectedProjectForDialogs}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleProjectUpdated}
          />

          <ArchiveProjectDialog
            project={selectedProjectForDialogs}
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
            onSuccess={handleProjectUpdated}
          />

          <DeleteProjectDialog
            project={selectedProjectForDialogs}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleProjectUpdated}
            hasDependencies={projectHasDependencies}
          />

          <AssignScholarToProjectDialog
            project={selectedProjectForDialogs}
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            onSuccess={handleProjectUpdated}
          />
        </>
      )}
    </div>
  );
}
