import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ThematicProjectWithKPIs } from '@/components/projects/ThematicProjectCard';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

interface UseThematicProjectsOptions {
  statusFilter?: 'all' | 'active' | 'inactive' | 'archived';
  searchTerm?: string;
  financiadorFilter?: string;
}

export function useThematicProjects(options: UseThematicProjectsOptions = {}) {
  const { statusFilter = 'all', searchTerm = '', financiadorFilter = '' } = options;

  return useQuery({
    queryKey: ['thematic-projects-with-kpis', statusFilter, searchTerm, financiadorFilter],
    queryFn: async () => {
      // Fetch thematic projects
      let query = supabase
        .from('projects')
        .select('id, code, title, empresa_parceira, status, start_date, end_date, observacoes')
        .eq('is_thematic', true)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ProjectStatus);
      }

      const { data: thematicProjects, error: projectsError } = await query;
      if (projectsError) throw projectsError;

      if (!thematicProjects || thematicProjects.length === 0) {
        return [];
      }

      const thematicIds = thematicProjects.map(p => p.id);

      // Fetch subprojects count for each thematic project
      const { data: subprojects, error: subprojectsError } = await supabase
        .from('projects')
        .select('id, parent_project_id, valor_mensal')
        .in('parent_project_id', thematicIds)
        .eq('is_thematic', false);

      if (subprojectsError) throw subprojectsError;

      // Get subproject IDs for enrollment lookup
      const subprojectIds = subprojects?.map(sp => sp.id) || [];

      // Fetch active enrollments for subprojects
      let enrollmentsData: { project_id: string; user_id: string }[] = [];
      if (subprojectIds.length > 0) {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('project_id, user_id')
          .in('project_id', subprojectIds)
          .eq('status', 'active');

        if (enrollmentsError) throw enrollmentsError;
        enrollmentsData = enrollments || [];
      }

      // Fetch reports to calculate compliance (pending/late)
      const scholarIds = [...new Set(enrollmentsData.map(e => e.user_id))];
      let reportsData: { user_id: string; status: string }[] = [];
      
      if (scholarIds.length > 0) {
        const { data: reports, error: reportsError } = await supabase
          .from('reports')
          .select('user_id, status')
          .in('user_id', scholarIds);

        if (reportsError) throw reportsError;
        reportsData = reports || [];
      }

      // Build KPIs for each thematic project
      const projectsWithKPIs: ThematicProjectWithKPIs[] = thematicProjects.map(thematic => {
        const linkedSubprojects = subprojects?.filter(sp => sp.parent_project_id === thematic.id) || [];
        const subprojectIds = linkedSubprojects.map(sp => sp.id);
        
        const linkedEnrollments = enrollmentsData.filter(e => subprojectIds.includes(e.project_id));
        const linkedScholarIds = [...new Set(linkedEnrollments.map(e => e.user_id))];
        
        const linkedReports = reportsData.filter(r => linkedScholarIds.includes(r.user_id));
        const pendingReports = linkedReports.filter(r => r.status === 'under_review').length;
        const lateReports = linkedReports.filter(r => r.status === 'returned').length;

        const totalMonthlyValue = linkedSubprojects.reduce((sum, sp) => sum + (sp.valor_mensal || 0), 0);

        return {
          id: thematic.id,
          code: thematic.code,
          title: thematic.title,
          empresa_parceira: thematic.empresa_parceira,
          status: thematic.status,
          start_date: thematic.start_date,
          end_date: thematic.end_date,
          observacoes: thematic.observacoes,
          subprojects_count: linkedSubprojects.length,
          active_scholars_count: linkedScholarIds.length,
          total_monthly_value: totalMonthlyValue,
          pending_reports: pendingReports,
          late_reports: lateReports,
        };
      });

      // Apply client-side filters
      let filtered = projectsWithKPIs;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          p => p.title.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
        );
      }

      if (financiadorFilter) {
        filtered = filtered.filter(p => p.empresa_parceira === financiadorFilter);
      }

      return filtered;
    },
  });
}

export function useFinanciadores() {
  return useQuery({
    queryKey: ['financiadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('empresa_parceira')
        .eq('is_thematic', true);

      if (error) throw error;

      // Get unique financiadores
      const unique = [...new Set(data?.map(p => p.empresa_parceira) || [])];
      return unique.sort();
    },
  });
}
