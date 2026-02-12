import { useState } from "react";
import { Database, Table, Download, Columns, Key, Link2, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  default_value: string | null;
  is_primary: boolean;
  is_foreign: boolean;
  fk_reference?: string;
}

interface TableDef {
  name: string;
  columns: ColumnDef[];
}

const SCHEMA: TableDef[] = [
  {
    name: "profiles",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "email", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "full_name", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "cpf", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "phone", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "avatar_url", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "institution", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "academic_level", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "lattes_url", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "origin", type: "text", nullable: true, default_value: "'manual'", is_primary: false, is_foreign: false },
      { name: "onboarding_status", type: "text", nullable: false, default_value: "'AGUARDANDO_ATRIBUICAO'", is_primary: false, is_foreign: false },
      { name: "is_active", type: "boolean", nullable: false, default_value: "true", is_primary: false, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "thematic_project_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "partner_company_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "invite_code_used", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "invite_used_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "profiles_sensitive",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "cpf", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "phone", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "user_roles",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "role", type: "app_role", nullable: false, default_value: null, is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "organizations",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "slug", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "logo_url", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "is_active", type: "boolean", nullable: false, default_value: "true", is_primary: false, is_foreign: false },
      { name: "email_notifications_enabled", type: "boolean", nullable: false, default_value: "true", is_primary: false, is_foreign: false },
      { name: "settings", type: "jsonb", nullable: true, default_value: "'{}'", is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "organization_members",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "role", type: "text", nullable: false, default_value: "'member'", is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "thematic_projects",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "title", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "sponsor_name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "status", type: "text", nullable: false, default_value: "'active'", is_primary: false, is_foreign: false },
      { name: "observations", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "start_date", type: "date", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "end_date", type: "date", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "projects",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "code", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "title", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "orientador", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "coordenador_tecnico_icca", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "modalidade_bolsa", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "valor_mensal", type: "numeric", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "status", type: "project_status", nullable: false, default_value: "'active'", is_primary: false, is_foreign: false },
      { name: "observacoes", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "thematic_project_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: true, fk_reference: "thematic_projects.id" },
      { name: "start_date", type: "date", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "end_date", type: "date", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "enrollments",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "project_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: true, fk_reference: "projects.id" },
      { name: "modality", type: "grant_modality", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "grant_value", type: "numeric", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "start_date", type: "date", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "end_date", type: "date", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "total_installments", type: "integer", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "status", type: "enrollment_status", nullable: false, default_value: "'active'", is_primary: false, is_foreign: false },
      { name: "observations", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "payments",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "enrollment_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: true, fk_reference: "enrollments.id" },
      { name: "report_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "reports.id" },
      { name: "installment_number", type: "integer", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "reference_month", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "amount", type: "numeric", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "status", type: "payment_status", nullable: false, default_value: "'pending'", is_primary: false, is_foreign: false },
      { name: "paid_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "receipt_url", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "reports",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "reference_month", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "installment_number", type: "integer", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_url", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "status", type: "text", nullable: false, default_value: "'under_review'", is_primary: false, is_foreign: false },
      { name: "observations", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "feedback", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "reviewed_by", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "reviewed_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "resubmission_deadline", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "submitted_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "bank_accounts",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "bank_name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "bank_code", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "agency", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "account_number", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "account_type", type: "text", nullable: true, default_value: "'checking'", is_primary: false, is_foreign: false },
      { name: "pix_key_type", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "pix_key_masked", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "pix_key_encrypted", type: "bytea", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "validation_status", type: "bank_validation_status", nullable: false, default_value: "'pending'", is_primary: false, is_foreign: false },
      { name: "locked_for_edit", type: "boolean", nullable: false, default_value: "false", is_primary: false, is_foreign: false },
      { name: "validated_by", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "validated_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "notes_gestor", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "grant_terms",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_url", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_size", type: "integer", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "signed_at", type: "date", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "uploaded_by", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "uploaded_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "invite_codes",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "code", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "thematic_project_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "partner_company_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "status", type: "text", nullable: false, default_value: "'active'", is_primary: false, is_foreign: false },
      { name: "max_uses", type: "integer", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "used_count", type: "integer", nullable: false, default_value: "0", is_primary: false, is_foreign: false },
      { name: "expires_at", type: "date", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_by", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "invite_code_uses",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "invite_code_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: true, fk_reference: "invite_codes.id" },
      { name: "used_by", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "used_by_email", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "used_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "messages",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "sender_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "recipient_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "subject", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "body", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "type", type: "text", nullable: false, default_value: "'GESTOR'", is_primary: false, is_foreign: false },
      { name: "event_type", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "read", type: "boolean", nullable: false, default_value: "false", is_primary: false, is_foreign: false },
      { name: "read_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "link_url", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "campaign_code", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "email_status", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "email_error", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "provider", type: "text", nullable: true, default_value: "'resend'", is_primary: false, is_foreign: false },
      { name: "provider_message_id", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "sent_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "delivered_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "deleted_at", type: "timestamptz", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: true, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "message_templates",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "subject", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "body", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "category", type: "text", nullable: false, default_value: "'general'", is_primary: false, is_foreign: false },
      { name: "html_template", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "is_default", type: "boolean", nullable: false, default_value: "false", is_primary: false, is_foreign: false },
      { name: "organization_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: true, fk_reference: "organizations.id" },
      { name: "created_by", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "notifications",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "title", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "message", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "type", type: "text", nullable: false, default_value: "'info'", is_primary: false, is_foreign: false },
      { name: "read", type: "boolean", nullable: false, default_value: "false", is_primary: false, is_foreign: false },
      { name: "entity_type", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "entity_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "audit_logs",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "user_id", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "user_email", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "action", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "entity_type", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "entity_id", type: "uuid", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "details", type: "jsonb", nullable: true, default_value: "'{}'", is_primary: false, is_foreign: false },
      { name: "previous_value", type: "jsonb", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "new_value", type: "jsonb", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "ip_address", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "user_agent", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
  {
    name: "institutional_documents",
    columns: [
      { name: "id", type: "uuid", nullable: false, default_value: "gen_random_uuid()", is_primary: true, is_foreign: false },
      { name: "title", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "description", type: "text", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "type", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_url", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_name", type: "text", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "file_size", type: "integer", nullable: true, default_value: null, is_primary: false, is_foreign: false },
      { name: "uploaded_by", type: "uuid", nullable: false, default_value: null, is_primary: false, is_foreign: false },
      { name: "created_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
      { name: "updated_at", type: "timestamptz", nullable: false, default_value: "now()", is_primary: false, is_foreign: false },
    ],
  },
];

const ENUMS = [
  { name: "app_role", values: ["admin", "manager", "scholar"] },
  { name: "bank_validation_status", values: ["pending", "under_review", "validated", "returned"] },
  { name: "enrollment_status", values: ["active", "suspended", "completed", "cancelled"] },
  { name: "grant_modality", values: ["ict", "ext", "ens", "ino", "dct_a", "dct_b", "dct_c", "postdoc", "senior", "prod", "visitor"] },
  { name: "payment_status", values: ["pending", "eligible", "paid", "cancelled"] },
  { name: "project_status", values: ["active", "inactive", "archived"] },
];

const STORAGE_BUCKETS = [
  { name: "reports", public: false },
  { name: "avatars", public: true },
  { name: "email-assets", public: true },
  { name: "payment-receipts", public: false },
  { name: "grant-terms", public: false },
  { name: "institutional-documents", public: true },
];

const EDGE_FUNCTIONS = [
  "assign-scholar-to-project",
  "cleanup-orphan-users",
  "create-users-batch",
  "delete-users",
  "manage-users",
  "monthly-report-reminder",
  "send-confirmation-email",
  "send-message-email",
  "send-password-reset",
  "send-system-email",
];

type Section = "tables" | "enums" | "storage" | "edge-functions";

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllTables() {
  const header = ["table", "column", "type", "nullable", "default", "primary_key", "foreign_key", "fk_reference"];
  const rows = [header];
  SCHEMA.forEach(t => t.columns.forEach(c => {
    rows.push([t.name, c.name, c.type, c.nullable ? "YES" : "NO", c.default_value ?? "", c.is_primary ? "YES" : "NO", c.is_foreign ? "YES" : "NO", c.fk_reference ?? ""]);
  }));
  downloadCSV("database_schema.csv", rows);
}

function exportEnums() {
  const rows = [["enum_name", "values"]];
  ENUMS.forEach(e => rows.push([e.name, e.values.join(", ")]));
  downloadCSV("database_enums.csv", rows);
}

function exportStorage() {
  const rows = [["bucket_name", "public"]];
  STORAGE_BUCKETS.forEach(b => rows.push([b.name, b.public ? "YES" : "NO"]));
  downloadCSV("storage_buckets.csv", rows);
}

function exportEdgeFunctions() {
  const rows = [["function_name"]];
  EDGE_FUNCTIONS.forEach(f => rows.push([f]));
  downloadCSV("edge_functions.csv", rows);
}

export default function DatabaseSchema() {
  const [activeSection, setActiveSection] = useState<Section>("tables");
  const [selectedTable, setSelectedTable] = useState<string>(SCHEMA[0].name);

  const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "tables", label: "Tabelas", icon: <Table className="w-4 h-4" /> },
    { id: "enums", label: "Enums", icon: <Hash className="w-4 h-4" /> },
    { id: "storage", label: "Storage", icon: <Database className="w-4 h-4" /> },
    { id: "edge-functions", label: "Edge Functions", icon: <Columns className="w-4 h-4" /> },
  ];

  const currentTable = SCHEMA.find(t => t.name === selectedTable);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Schema Explorer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Estrutura do banco de dados</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2">Exportar tudo</p>
          <div className="space-y-1">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={exportAllTables}>
              <Download className="w-3 h-3 mr-1.5" /> Tabelas CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={exportEnums}>
              <Download className="w-3 h-3 mr-1.5" /> Enums CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={exportStorage}>
              <Download className="w-3 h-3 mr-1.5" /> Storage CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={exportEdgeFunctions}>
              <Download className="w-3 h-3 mr-1.5" /> Edge Functions CSV
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeSection === "tables" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Tabelas ({SCHEMA.length})</h2>
              <Button onClick={exportAllTables} size="sm">
                <Download className="w-4 h-4 mr-2" /> Exportar todas em CSV
              </Button>
            </div>

            {/* Table selector */}
            <div className="flex flex-wrap gap-2">
              {SCHEMA.map(t => (
                <Badge
                  key={t.name}
                  variant={selectedTable === t.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTable(t.name)}
                >
                  {t.name}
                </Badge>
              ))}
            </div>

            {/* Column details */}
            {currentTable && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Table className="w-4 h-4 text-primary" />
                    {currentTable.name}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({currentTable.columns.length} colunas)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[60vh]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-3 font-medium">Coluna</th>
                          <th className="text-left p-3 font-medium">Tipo</th>
                          <th className="text-left p-3 font-medium">Nullable</th>
                          <th className="text-left p-3 font-medium">Default</th>
                          <th className="text-left p-3 font-medium">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTable.columns.map(col => (
                          <tr key={col.name} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-3 font-mono text-xs">{col.name}</td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-xs font-mono">
                                {col.type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className={cn("text-xs", col.nullable ? "text-muted-foreground" : "text-foreground font-medium")}>
                                {col.nullable ? "YES" : "NOT NULL"}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-xs text-muted-foreground">
                              {col.default_value ?? "—"}
                            </td>
                            <td className="p-3 flex gap-1.5 flex-wrap">
                              {col.is_primary && (
                                <Badge variant="default" className="text-[10px] gap-1">
                                  <Key className="w-3 h-3" /> PK
                                </Badge>
                              )}
                              {col.is_foreign && (
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  <Link2 className="w-3 h-3" /> FK → {col.fk_reference}
                                </Badge>
                              )}
                              {col.name.endsWith("_at") && (
                                <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                                  <Clock className="w-3 h-3" /> timestamp
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeSection === "enums" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Enums ({ENUMS.length})</h2>
              <Button onClick={exportEnums} size="sm">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {ENUMS.map(e => (
                <Card key={e.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">{e.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {e.values.map(v => (
                        <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === "storage" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Storage Buckets ({STORAGE_BUCKETS.length})</h2>
              <Button onClick={exportStorage} size="sm">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {STORAGE_BUCKETS.map(b => (
                <Card key={b.name}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <span className="font-mono text-sm">{b.name}</span>
                    <Badge variant={b.public ? "default" : "secondary"}>
                      {b.public ? "Público" : "Privado"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === "edge-functions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Edge Functions ({EDGE_FUNCTIONS.length})</h2>
              <Button onClick={exportEdgeFunctions} size="sm">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {EDGE_FUNCTIONS.map(f => (
                <Card key={f}>
                  <CardContent className="pt-6">
                    <span className="font-mono text-sm">{f}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}