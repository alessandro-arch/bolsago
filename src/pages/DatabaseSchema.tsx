import { useState } from "react";
import { Database, Table, Download, Columns, Key, Link2, Clock, Hash, Code, Copy, Check, Shield, Zap } from "lucide-react";
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

interface EdgeFunctionCode {
  name: string;
  code: string;
}

const EDGE_FUNCTION_CODES: EdgeFunctionCode[] = [
  {
    name: "assign-scholar-to-project",
    code: `// Assigns a scholar to a project and creates enrollment with payment installments
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  "https://sisconnecta.lovable.app",
  "https://www.innovago.app",
  "https://id-preview--2b9d72d4-676d-41a6-bf6b-707f4c8b4527.lovable.app",
];

// Validates UUID format
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - CORS handling
  // - User authentication verification
  // - Role-based access control (manager/admin only)
  // - Project validation and date range checks
  // - Duplicate enrollment prevention
  // - Enrollment creation with payment installments
  // - Audit logging
})`,
  },
  {
    name: "cleanup-orphan-users",
    code: `// Identifies and removes orphaned auth users (no matching profile)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lists all auth users and profiles
// Finds users in auth but not in profiles
// Optionally deletes orphaned users with cleanup

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Admin-only access control
  // - Listing all auth users (perPage: 1000)
  // - Comparing against profiles table
  // - Safe deletion of orphaned records
  // - Cleanup of associated user_roles
})`,
  },
  {
    name: "create-users-batch",
    code: `// Batch creates scholar accounts with auto-confirm and profile setup
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supports two actions:
// 1. Create new users: validates email/CPF, creates auth user, creates profile
// 2. Reset password: generates secure random passwords for existing users

const ALLOWED_ORIGINS = [
  "https://sisconnecta.lovable.app",
  "https://www.innovago.app",
  "https://id-preview--2b9d72d4-676d-41a6-bf6b-707f4c8b4527.lovable.app",
];

function generateRandomPassword(): string {
  // ... 16-char cryptographically random password with mixed case, digits, and special chars
}

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Batch user creation (max 100 per request)
  // - Email format validation
  // - CPF validation (11+ digits)
  // - Automatic profile creation via trigger
  // - Fallback manual profile creation if trigger fails
  // - Invite code validation and usage tracking
  // - Password reset functionality
})`,
  },
  {
    name: "delete-users",
    code: `// Permanently deletes users and all associated data
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Requires admin role
// Prevents self-deletion
// Validates UUID format for all user IDs

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Admin-only access control
  // - Self-deletion prevention
  // - Batch deletion (max 100 users per request)
  // - Cascading deletion of:
  //   - user_roles
  //   - profiles
  //   - enrollments
  //   - payments
  //   - reports
  //   - bank_accounts
  //   - auth.users
})`,
  },
  {
    name: "manage-users",
    code: `// Manages user lifecycle: deactivate, reactivate, or permanently delete
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Three actions:
// 1. deactivate: marks user as inactive, suspends active enrollments
// 2. reactivate: marks user as active
// 3. delete: permanently removes user (admin only)

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Manager/admin access control
  // - User existence validation
  // - Deactivation with enrollment suspension
  // - Reactivation support
  // - Permanent deletion with dependency checks
  // - Prevents deletion of users with active enrollments/payments/reports
})`,
  },
  {
    name: "monthly-report-reminder",
    code: `// Sends monthly report reminders to scholars with active enrollments
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Gets active enrollments
// Filters scholars who haven't submitted reports for current month
// Sends inbox messages and emails (if enabled)

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Active enrollment detection
  // - Monthly report submission tracking
  // - Scholar deduplication (handles multiple enrollments)
  // - Organization email notification settings check
  // - HTML email template generation
  // - Resend API integration
})`,
  },
  {
    name: "send-confirmation-email",
    code: `// Sends email confirmation for signup and email change actions
import { Resend } from "https://esm.sh/resend@4.0.0";

// Triggered by Supabase auth hook
// Generates professional HTML email with verification link
// Includes security information and fallback link

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Auth webhook payload parsing
  // - Email action type validation (signup, email_change)
  // - Confirmation URL generation with token
  // - HTML email template with branding
  // - Security notice with link expiry info
  // - Resend email delivery
})`,
  },
  {
    name: "send-message-email",
    code: `// Sends manager/system messages to scholars via email
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://bolsago.lovable.app",
  "https://www.innovago.app",
  "https://id-preview--2b9d72d4-676d-41a6-bf6b-707f4c8b4527.lovable.app",
  "https://2b9d72d4-676d-41a6-bf6b-707f4c8b4527.lovableproject.com",
];

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Manager/admin authentication
  // - Recipient profile lookup
  // - Organization email settings check
  // - Custom message template support
  // - HTML email generation
  // - Resend delivery with error handling
})`,
  },
  {
    name: "send-password-reset",
    code: `// Sends password reset email with secure verification link
import { Resend } from "https://esm.sh/resend@4.0.0";

// Triggered by Supabase auth hook
// Only processes 'recovery' email action type
// Generates professional HTML email with reset link

Deno.serve(async (req: Request): Promise<Response> => {
  // ... Full implementation includes:
  // - Auth webhook payload parsing
  // - Recovery action type validation
  // - Password reset URL generation
  // - HTML email template with security info
  // - Link expiry notice (1 hour)
  // - Resend email delivery
})`,
  },
  {
    name: "send-system-email",
    code: `// Sends system notification emails to scholars
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Used by triggers for automated notifications:
// - Report status changes (approved, rejected)
// - Payment status updates (eligible, paid, cancelled)
// - Monthly report reminders

Deno.serve(async (req) => {
  // ... Full implementation includes:
  // - Message lookup from database
  // - Recipient info retrieval
  // - Professional HTML template
  // - Dynamic subject and body
  // - Resend email delivery
  // - Email status tracking
})`,
  },
];

type Section = "tables" | "enums" | "storage" | "edge-functions" | "edge-function-code" | "sql-migration" | "rls-policies" | "auxiliary-functions";

// =============================================
// RLS POLICIES DATA
// =============================================

const STORAGE_RLS_POLICIES = `-- =============================================
-- STORAGE BUCKETS - Criação com visibilidade correta
-- =============================================

-- Buckets PRIVADOS
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('grant-terms', 'grant-terms', false);

-- Buckets PÚBLICOS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('email-assets', 'email-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('institutional-documents', 'institutional-documents', true);

-- =============================================
-- STORAGE RLS POLICIES
-- =============================================

-- ============ BUCKET: reports (privado) ============
CREATE POLICY "Scholars can upload own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND auth.uid()::text = (storage.foldername(name))[3]
);

CREATE POLICY "Scholars can view own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.uid()::text = (storage.foldername(name))[3]
);

CREATE POLICY "Managers can view all reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Managers can delete reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- ============ BUCKET: avatars (público) ============
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============ BUCKET: email-assets (público) ============
CREATE POLICY "Email assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'email-assets');

CREATE POLICY "Managers can upload email assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'email-assets'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- ============ BUCKET: payment-receipts (privado) ============
CREATE POLICY "Managers can upload payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Managers can view payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Scholars can view own payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============ BUCKET: grant-terms (privado) ============
CREATE POLICY "Managers can upload grant terms"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'grant-terms'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Managers can view grant terms"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'grant-terms'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Scholars can view own grant terms"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'grant-terms'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============ BUCKET: institutional-documents (público) ============
CREATE POLICY "Institutional docs are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'institutional-documents');

CREATE POLICY "Managers can upload institutional docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institutional-documents'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Managers can update institutional docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'institutional-documents'
  AND (
    public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Admins can delete institutional docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'institutional-documents'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);`;

interface TableRLSPolicies {
  table: string;
  sql: string;
}

const TABLE_RLS_POLICIES: TableRLSPolicies[] = [
  {
    table: "profiles",
    sql: `-- RLS Policies: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_select" ON public.profiles
  AS RESTRICTIVE FOR SELECT USING (false);

CREATE POLICY "Profiles: select own" ON public.profiles
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Profiles: select admin" ON public.profiles
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Profiles: select manager org-scoped" ON public.profiles
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND organization_id IN (SELECT get_user_organizations()));

CREATE POLICY "Profiles: insert own" ON public.profiles
  AS RESTRICTIVE FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Profiles: update own non-sensitive" ON public.profiles
  AS RESTRICTIVE FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "profiles_sensitive",
    sql: `-- RLS Policies: profiles_sensitive
ALTER TABLE public.profiles_sensitive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_sensitive FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "user_roles",
    sql: `-- RLS Policies: user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_select" ON public.user_roles
  AS RESTRICTIVE FOR SELECT USING (false);

CREATE POLICY "Roles: select own" ON public.user_roles
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Roles: select admin" ON public.user_roles
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Roles: select manager" ON public.user_roles
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Roles: insert admin only" ON public.user_roles
  AS RESTRICTIVE FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Roles: update admin only" ON public.user_roles
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Roles: delete admin only" ON public.user_roles
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "organizations",
    sql: `-- RLS Policies: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_select_members" ON public.organizations
  AS RESTRICTIVE FOR SELECT USING (user_has_org_access(id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_insert_admin" ON public.organizations
  AS RESTRICTIVE FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_update_owner" ON public.organizations
  AS RESTRICTIVE FOR UPDATE USING (user_org_role(id) = 'owner' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_delete_superadmin" ON public.organizations
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "organization_members",
    sql: `-- RLS Policies: organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select" ON public.organization_members
  AS RESTRICTIVE FOR SELECT
  USING (user_has_org_access(organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_members_insert_owner" ON public.organization_members
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (user_org_role(organization_id) IN ('owner', 'admin') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_members_update_owner" ON public.organization_members
  AS RESTRICTIVE FOR UPDATE
  USING (user_org_role(organization_id) IN ('owner', 'admin') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_members_delete_owner" ON public.organization_members
  AS RESTRICTIVE FOR DELETE
  USING (user_org_role(organization_id) IN ('owner', 'admin') OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "thematic_projects",
    sql: `-- RLS Policies: thematic_projects
ALTER TABLE public.thematic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thematic_projects FORCE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Scholars can view their thematic project" ON public.thematic_projects
  AS RESTRICTIVE FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM enrollments e
    JOIN projects p ON e.project_id = p.id
    WHERE p.thematic_project_id = thematic_projects.id AND e.user_id = auth.uid()
  ));

CREATE POLICY "Managers can insert thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can update thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "projects",
    sql: `-- RLS Policies: projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all projects" ON public.projects
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Scholars can view their projects" ON public.projects
  AS RESTRICTIVE FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM enrollments WHERE project_id = projects.id AND user_id = auth.uid()
  ));

CREATE POLICY "Managers can insert projects" ON public.projects
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can update projects" ON public.projects
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can delete projects" ON public.projects
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "enrollments",
    sql: `-- RLS Policies: enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments FORCE ROW LEVEL SECURITY;

CREATE POLICY "Enrollments: select own" ON public.enrollments
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enrollments: select manager/admin" ON public.enrollments
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can insert enrollments" ON public.enrollments
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can update enrollments" ON public.enrollments
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can delete enrollments" ON public.enrollments
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "payments",
    sql: `-- RLS Policies: payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;

CREATE POLICY "Scholars can view their own payments" ON public.payments
  AS RESTRICTIVE FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all payments" ON public.payments
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can insert payments" ON public.payments
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can update payments" ON public.payments
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "reports",
    sql: `-- RLS Policies: reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_select" ON public.reports
  AS RESTRICTIVE FOR SELECT USING (false);

CREATE POLICY "Reports: select own" ON public.reports
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Reports: select admin" ON public.reports
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Reports: select manager org-scoped" ON public.reports
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = reports.user_id
    AND p.organization_id IN (SELECT get_user_organizations())
  ));

CREATE POLICY "Reports: insert own" ON public.reports
  AS RESTRICTIVE FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Reports: update admin" ON public.reports
  AS RESTRICTIVE FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Reports: update manager org-scoped" ON public.reports
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = reports.user_id
    AND p.organization_id IN (SELECT get_user_organizations())
  ));`,
  },
  {
    table: "bank_accounts",
    sql: `-- RLS Policies: bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_select" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT USING (false);

CREATE POLICY "bank_accounts_select_own" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "bank_accounts_select_admin" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "bank_accounts_select_manager_org_scoped" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id));

CREATE POLICY "Users can view their own bank account" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bank_accounts_insert_own" ON public.bank_accounts
  AS RESTRICTIVE FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own bank account" ON public.bank_accounts
  AS RESTRICTIVE FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bank_accounts_update_own_unvalidated" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (
    user_id = auth.uid()
    AND COALESCE(locked_for_edit, false) = false
    AND COALESCE(validation_status, 'pending'::bank_validation_status) IN ('pending', 'returned')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND COALESCE(locked_for_edit, false) = false
    AND COALESCE(validation_status, 'pending'::bank_validation_status) IN ('pending', 'returned')
  );

CREATE POLICY "Users can update their own bank account when not locked" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (auth.uid() = user_id AND locked_for_edit = false)
  WITH CHECK (auth.uid() = user_id AND locked_for_edit = false);

CREATE POLICY "bank_accounts_update_admin" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "bank_accounts_update_manager_org_scoped" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id));

CREATE POLICY "bank_accounts_delete_own_unvalidated" ON public.bank_accounts
  AS RESTRICTIVE FOR DELETE
  USING (
    user_id = auth.uid()
    AND COALESCE(validation_status, 'pending'::bank_validation_status) IN ('pending', 'returned')
  );`,
  },
  {
    table: "grant_terms",
    sql: `-- RLS Policies: grant_terms
ALTER TABLE public.grant_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_terms FORCE ROW LEVEL SECURITY;

CREATE POLICY "grant_terms_select_own" ON public.grant_terms
  AS RESTRICTIVE FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "grant_terms_select_manager" ON public.grant_terms
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "grant_terms_insert_manager" ON public.grant_terms
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "grant_terms_update_manager" ON public.grant_terms
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "grant_terms_delete_admin" ON public.grant_terms
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "invite_codes",
    sql: `-- RLS Policies: invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes FORCE ROW LEVEL SECURITY;

CREATE POLICY "invite_codes_select_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "invite_codes_insert_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "invite_codes_update_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "invite_codes_delete_admin_only" ON public.invite_codes
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "invite_code_uses",
    sql: `-- RLS Policies: invite_code_uses
ALTER TABLE public.invite_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_uses FORCE ROW LEVEL SECURITY;

CREATE POLICY "invite_code_uses_select_manager_admin" ON public.invite_code_uses
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "messages",
    sql: `-- RLS Policies: messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

CREATE POLICY "messages_deny_anon" ON public.messages
  AS RESTRICTIVE FOR SELECT USING (false);

CREATE POLICY "messages_select_own" ON public.messages
  AS RESTRICTIVE FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "messages_select_admin_all" ON public.messages
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "messages_select_manager_org" ON public.messages
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND organization_id IN (SELECT get_user_organizations()));

CREATE POLICY "messages_insert_manager" ON public.messages
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "messages_update_own" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "messages_update_admin_all" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "messages_update_manager_org" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) AND organization_id IN (SELECT get_user_organizations()))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND organization_id IN (SELECT get_user_organizations()));`,
  },
  {
    table: "message_templates",
    sql: `-- RLS Policies: message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates FORCE ROW LEVEL SECURITY;

CREATE POLICY "templates_select_manager" ON public.message_templates
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "templates_insert_manager" ON public.message_templates
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "templates_update_manager" ON public.message_templates
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "templates_delete_manager" ON public.message_templates
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "notifications",
    sql: `-- RLS Policies: notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  AS RESTRICTIVE FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert notifications" ON public.notifications
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  AS RESTRICTIVE FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  AS RESTRICTIVE FOR DELETE USING (auth.uid() = user_id);`,
  },
  {
    table: "audit_logs",
    sql: `-- RLS Policies: audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_select" ON public.audit_logs
  AS RESTRICTIVE FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "deny_anon_insert" ON public.audit_logs
  AS RESTRICTIVE FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  AS RESTRICTIVE FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "institutional_documents",
    sql: `-- RLS Policies: institutional_documents
ALTER TABLE public.institutional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_documents FORCE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can insert institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can update institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
];

function generateAllRLSPoliciesSQL(): string {
  const parts: string[] = [];
  parts.push("-- =============================================");
  parts.push("-- COMPLETE RLS POLICIES MIGRATION SCRIPT");
  parts.push(`-- Generated at: ${new Date().toISOString()}`);
  parts.push("-- =============================================\n");
  parts.push("-- PREREQUISITE: Ensure the has_role(), user_has_org_access(),");
  parts.push("-- get_user_organizations(), user_org_role(), and");
  parts.push("-- user_can_access_profile_by_org() functions exist.\n");
  
  parts.push("-- =============================================");
  parts.push("-- SECTION 1: STORAGE BUCKETS + POLICIES");
  parts.push("-- =============================================\n");
  parts.push(STORAGE_RLS_POLICIES);
  
  parts.push("\n\n-- =============================================");
  parts.push("-- SECTION 2: TABLE RLS POLICIES");
  parts.push("-- =============================================\n");
  TABLE_RLS_POLICIES.forEach(p => {
    parts.push(p.sql);
    parts.push("");
  });
  
  return parts.join("\n");
}

function generateCreateTableSQL(table: TableDef): string {
  const lines: string[] = [];
  lines.push(`CREATE TABLE public.${table.name} (`);
  
  const colLines: string[] = [];
  const fkLines: string[] = [];
  
  table.columns.forEach(col => {
    let colDef = `  ${col.name} ${col.type === "timestamptz" ? "timestamp with time zone" : col.type}`;
    if (!col.nullable) colDef += " NOT NULL";
    if (col.default_value) colDef += ` DEFAULT ${col.default_value}`;
    if (col.is_primary) colDef += " PRIMARY KEY";
    colLines.push(colDef);
    
    if (col.is_foreign && col.fk_reference) {
      const [refTable, refCol] = col.fk_reference.split(".");
      fkLines.push(`  CONSTRAINT ${table.name}_${col.name}_fkey FOREIGN KEY (${col.name}) REFERENCES public.${refTable}(${refCol})`);
    }
  });
  
  lines.push([...colLines, ...fkLines].join(",\n"));
  lines.push(");");
  lines.push("");
  lines.push(`-- Enable RLS`);
  lines.push(`ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;`);
  
  return lines.join("\n");
}

function generateAllEnumsSQL(): string {
  return ENUMS.map(e => {
    const values = e.values.map(v => `'${v}'`).join(", ");
    return `CREATE TYPE public.${e.name} AS ENUM (${values});`;
  }).join("\n\n");
}

function generateFullMigrationSQL(): string {
  const parts: string[] = [];
  parts.push("-- =============================================");
  parts.push("-- FULL DATABASE MIGRATION SCRIPT");
  parts.push(`-- Generated at: ${new Date().toISOString()}`);
  parts.push("-- =============================================\n");
  parts.push("-- 1. ENUMS");
  parts.push("-- =============================================\n");
  parts.push(generateAllEnumsSQL());
  parts.push("\n\n-- =============================================");
  parts.push("-- 2. TABLES");
  parts.push("-- =============================================\n");
  SCHEMA.forEach(t => {
    parts.push(`-- Table: ${t.name}`);
    parts.push(generateCreateTableSQL(t));
    parts.push("");
  });
  return parts.join("\n");
}

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

interface AuxiliaryFunction {
  name: string;
  description: string;
  code: string;
}

const AUXILIARY_FUNCTIONS: AuxiliaryFunction[] = [
  {
    name: "has_role",
    description: "Verifica se um usuário tem um papel específico (admin, manager, scholar). Usa SECURITY DEFINER para evitar recursão nas RLS policies.",
    code: `CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;`,
  },
  {
    name: "get_user_organizations",
    description: "Retorna lista de UUIDs das organizações do usuário autenticado. Usado para isolamento multi-tenant.",
    code: `CREATE OR REPLACE FUNCTION public.get_user_organizations()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
$function$;`,
  },
  {
    name: "user_has_org_access",
    description: "Verifica se o usuário autenticado tem acesso a uma organização específica.",
    code: `CREATE OR REPLACE FUNCTION public.user_has_org_access(p_org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
  )
$function$;`,
  },
  {
    name: "user_org_role",
    description: "Retorna o papel do usuário dentro de uma organização específica ('owner', 'admin', 'member').",
    code: `CREATE OR REPLACE FUNCTION public.user_org_role(p_org_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.organization_members
  WHERE organization_id = p_org_id
    AND user_id = auth.uid()
  LIMIT 1
$function$;`,
  },
  {
    name: "user_can_access_profile_by_org",
    description: "Valida se o gestor/admin pode acessar o perfil de outro usuário (verificando se estão na mesma organização).",
    code: `CREATE OR REPLACE FUNCTION public.user_can_access_profile_by_org(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Admin can access all
  SELECT CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN true
    -- Manager can access if target user is in same organization
    WHEN has_role(auth.uid(), 'manager'::app_role) THEN EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = p_user_id
        AND p.organization_id IN (SELECT get_user_organizations())
    )
    ELSE false
  END;
$function$;`,
  },
];


export default function DatabaseSchema() {
  const [activeSection, setActiveSection] = useState<Section>("tables");
  const [selectedTable, setSelectedTable] = useState<string>(SCHEMA[0].name);
  const [selectedFunction, setSelectedFunction] = useState<string>(EDGE_FUNCTION_CODES[0].name);
  const [selectedAuxFunction, setSelectedAuxFunction] = useState<string>(AUXILIARY_FUNCTIONS[0].name);
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  const copyToClipboard = (text: string, tableName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTable(tableName);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "tables", label: "Tabelas", icon: <Table className="w-4 h-4" /> },
    { id: "enums", label: "Enums", icon: <Hash className="w-4 h-4" /> },
    { id: "storage", label: "Storage", icon: <Database className="w-4 h-4" /> },
    { id: "edge-functions", label: "Edge Functions", icon: <Columns className="w-4 h-4" /> },
    { id: "edge-function-code", label: "Edge Function Code", icon: <Code className="w-4 h-4" /> },
    { id: "sql-migration", label: "SQL Migration", icon: <Code className="w-4 h-4" /> },
    { id: "rls-policies", label: "RLS Policies", icon: <Shield className="w-4 h-4" /> },
    { id: "auxiliary-functions", label: "Funções Auxiliares", icon: <Zap className="w-4 h-4" /> },
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

        {activeSection === "sql-migration" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">SQL Migration Scripts</h2>
              <Button
                onClick={() => copyToClipboard(generateFullMigrationSQL(), "__full__")}
                size="sm"
              >
                {copiedTable === "__full__" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedTable === "__full__" ? "Copiado!" : "Copiar script completo"}
              </Button>
            </div>

            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Enums (executar primeiro)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-7 text-xs"
                    onClick={() => copyToClipboard(generateAllEnumsSQL(), "__enums__")}
                  >
                    {copiedTable === "__enums__" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground">
                    {generateAllEnumsSQL()}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {SCHEMA.map(table => {
              const sql = generateCreateTableSQL(table);
              return (
                <Card key={table.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-primary" />
                        {table.name}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({table.columns.length} colunas)
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => copyToClipboard(sql, table.name)}
                      >
                        {copiedTable === table.name ? (
                          <><Check className="w-3 h-3" /> Copiado</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copiar</>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground">
                      {sql}
                    </pre>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeSection === "edge-function-code" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Edge Function Code ({EDGE_FUNCTION_CODES.length})</h2>
            </div>

            {/* Function selector */}
            <div className="flex flex-wrap gap-2">
              {EDGE_FUNCTION_CODES.map(f => (
                <Badge
                  key={f.name}
                  variant={selectedFunction === f.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFunction(f.name)}
                >
                  {f.name}
                </Badge>
              ))}
            </div>

            {/* Code viewer */}
            {EDGE_FUNCTION_CODES.map(func => (
              selectedFunction === func.name && (
                <Card key={func.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        {func.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => copyToClipboard(func.code, func.name)}
                      >
                        {copiedTable === func.name ? (
                          <><Check className="w-3 h-3" /> Copiado</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copiar</>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[70vh] overflow-y-auto">
                      {func.code}
                    </pre>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}

        {activeSection === "rls-policies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">RLS Policies (Storage + {TABLE_RLS_POLICIES.length} Tabelas)</h2>
              <Button
                onClick={() => copyToClipboard(generateAllRLSPoliciesSQL(), "__rls_full__")}
                size="sm"
              >
                {copiedTable === "__rls_full__" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedTable === "__rls_full__" ? "Copiado!" : "Copiar script completo"}
              </Button>
            </div>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-4">
                <p className="text-sm text-destructive">
                  <strong>Pré-requisito:</strong> Execute primeiro os scripts de <strong>Enums</strong>, <strong>Tabelas</strong> e <strong>Funções auxiliares</strong> (has_role, user_has_org_access, get_user_organizations, user_org_role, user_can_access_profile_by_org) antes de aplicar as RLS policies.
                </p>
              </CardContent>
            </Card>

            {/* Storage Buckets + Policies */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Storage Buckets + Policies (6 buckets)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => copyToClipboard(STORAGE_RLS_POLICIES, "__storage_rls__")}
                  >
                    {copiedTable === "__storage_rls__" ? (
                      <><Check className="w-3 h-3" /> Copiado</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copiar</>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">
                  {STORAGE_RLS_POLICIES}
                </pre>
              </CardContent>
            </Card>

            {/* Table RLS Policies */}
            {TABLE_RLS_POLICIES.map(policy => (
              <Card key={policy.table}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      {policy.table}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(policy.sql, `rls_${policy.table}`)}
                    >
                      {copiedTable === `rls_${policy.table}` ? (
                        <><Check className="w-3 h-3" /> Copiado</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copiar</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground">
                    {policy.sql}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeSection === "auxiliary-functions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Funções Auxiliares ({AUXILIARY_FUNCTIONS.length})</h2>
              <p className="text-xs text-muted-foreground">Funções SECURITY DEFINER para RLS policies</p>
            </div>

            {/* Function selector */}
            <div className="flex flex-wrap gap-2">
              {AUXILIARY_FUNCTIONS.map(f => (
                <Badge
                  key={f.name}
                  variant={selectedAuxFunction === f.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedAuxFunction(f.name)}
                >
                  {f.name}
                </Badge>
              ))}
            </div>

            {/* Function detail */}
            {AUXILIARY_FUNCTIONS.filter(f => f.name === selectedAuxFunction).map(f => (
              <Card key={f.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-col">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        {f.name}
                      </span>
                      <p className="text-xs font-normal text-muted-foreground mt-2">{f.description}</p>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(f.code, f.name)}
                    >
                      {copiedTable === f.name ? (
                        <><Check className="w-3 h-3" /> Copiado</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copiar</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">
                    {f.code}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}