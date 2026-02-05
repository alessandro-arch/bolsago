-- Add hierarchical project structure fields
ALTER TABLE public.projects
ADD COLUMN is_thematic BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN parent_project_id UUID NULL REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_projects_parent_project_id ON public.projects(parent_project_id);
CREATE INDEX idx_projects_is_thematic ON public.projects(is_thematic);

-- Update existing project to be a thematic project (master)
-- The first project with code containing patterns typical of thematic projects
UPDATE public.projects 
SET is_thematic = true 
WHERE id IN (
  SELECT id FROM public.projects 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Add comment for documentation
COMMENT ON COLUMN public.projects.is_thematic IS 'Indicates if this is a master thematic project (true) or a subproject (false)';
COMMENT ON COLUMN public.projects.parent_project_id IS 'Reference to the parent thematic project for subprojects';