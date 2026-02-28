
-- Add SELECT RLS policies for auditors on key tables (read-only, no bank data)

CREATE POLICY "Profiles: select auditor"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Projects: select auditor"
ON public.projects FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Thematic projects: select auditor"
ON public.thematic_projects FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Enrollments: select auditor"
ON public.enrollments FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Payments: select auditor"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Reports: select auditor"
ON public.reports FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Audit logs: select auditor"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Organizations: select auditor"
ON public.organizations FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "Org members: select auditor"
ON public.organization_members FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));
