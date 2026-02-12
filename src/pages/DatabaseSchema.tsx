import { useState } from "react";
import { Database, Table, Download, Columns, Key, Link2, Clock, Hash, Code, Copy, Check, Shield, Zap, Settings, HardDrive } from "lucide-react";
import { DATA_MIGRATION_STRATEGY, AUTH_USERS_MIGRATION, MIGRATION_SCRIPTS, DISABLE_TRIGGERS_SCRIPT, VERIFICATION_SCRIPT } from "./DataMigrationScripts";
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

type Section = "tables" | "enums" | "storage" | "edge-functions" | "edge-function-code" | "sql-migration" | "rls-policies" | "auxiliary-functions" | "database-functions" | "triggers" | "vault" | "data-migration";

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
    table: "audit_logs (3 policies)",
    sql: `-- RLS Policies: audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "deny_anon_select" ON public.audit_logs
  AS RESTRICTIVE FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT (public)
CREATE POLICY "deny_anon_insert" ON public.audit_logs
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);`,
  },
  {
    table: "bank_accounts (12 policies)",
    sql: `-- RLS Policies: bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts FORCE ROW LEVEL SECURITY;

-- SELECT (authenticated)
CREATE POLICY "Users can view their own bank account" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- SELECT (authenticated)
CREATE POLICY "bank_accounts_select_own" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- INSERT (authenticated)
CREATE POLICY "Users can insert their own bank account" ON public.bank_accounts
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- INSERT (authenticated)
CREATE POLICY "bank_accounts_insert_own" ON public.bank_accounts
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE (authenticated)
CREATE POLICY "bank_accounts_update_own_unvalidated" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid())
    AND (COALESCE(locked_for_edit, false) = false)
    AND (COALESCE(validation_status, 'pending'::bank_validation_status) = ANY (ARRAY['pending'::bank_validation_status, 'returned'::bank_validation_status]))
  )
  WITH CHECK (
    (user_id = auth.uid())
    AND (COALESCE(locked_for_edit, false) = false)
    AND (COALESCE(validation_status, 'pending'::bank_validation_status) = ANY (ARRAY['pending'::bank_validation_status, 'returned'::bank_validation_status]))
  );

-- DELETE (authenticated)
CREATE POLICY "bank_accounts_delete_own_unvalidated" ON public.bank_accounts
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid())
    AND (COALESCE(validation_status, 'pending'::bank_validation_status) = ANY (ARRAY['pending'::bank_validation_status, 'returned'::bank_validation_status]))
  );

-- SELECT (public)
CREATE POLICY "bank_accounts_select_admin" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "bank_accounts_select_manager_org_scoped" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id));

-- SELECT (anon)
CREATE POLICY "deny_anon_select" ON public.bank_accounts
  AS RESTRICTIVE FOR SELECT TO anon
  USING (false);

-- UPDATE (public)
CREATE POLICY "Users can update their own bank account when not locked" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING ((auth.uid() = user_id) AND (locked_for_edit = false))
  WITH CHECK ((auth.uid() = user_id) AND (locked_for_edit = false));

-- UPDATE (public)
CREATE POLICY "bank_accounts_update_admin" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "bank_accounts_update_manager_org_scoped" ON public.bank_accounts
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND user_can_access_profile_by_org(user_id));`,
  },
  {
    table: "enrollments (5 policies)",
    sql: `-- RLS Policies: enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments FORCE ROW LEVEL SECURITY;

-- SELECT (authenticated)
CREATE POLICY "Enrollments: select manager/admin" ON public.enrollments
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- SELECT (authenticated)
CREATE POLICY "Enrollments: select own" ON public.enrollments
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- INSERT (public)
CREATE POLICY "Managers can insert enrollments" ON public.enrollments
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Managers can update enrollments" ON public.enrollments
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "Managers can delete enrollments" ON public.enrollments
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "grant_terms (5 policies)",
    sql: `-- RLS Policies: grant_terms
ALTER TABLE public.grant_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_terms FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "grant_terms_select_manager" ON public.grant_terms
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "grant_terms_select_own" ON public.grant_terms
  AS RESTRICTIVE FOR SELECT
  USING (user_id = auth.uid());

-- INSERT (public)
CREATE POLICY "grant_terms_insert_manager" ON public.grant_terms
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "grant_terms_update_manager" ON public.grant_terms
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "grant_terms_delete_admin" ON public.grant_terms
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "institutional_documents (4 policies)",
    sql: `-- RLS Policies: institutional_documents
ALTER TABLE public.institutional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_documents FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "All authenticated users can view institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT (public)
CREATE POLICY "Managers can insert institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Managers can update institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "Admins can delete institutional documents" ON public.institutional_documents
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "invite_code_uses (1 policy)",
    sql: `-- RLS Policies: invite_code_uses
ALTER TABLE public.invite_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_uses FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "invite_code_uses_select_manager_admin" ON public.invite_code_uses
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "invite_codes (4 policies)",
    sql: `-- RLS Policies: invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "invite_codes_select_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- INSERT (public)
CREATE POLICY "invite_codes_insert_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "invite_codes_update_manager_admin" ON public.invite_codes
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "invite_codes_delete_admin_only" ON public.invite_codes
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "message_templates (4 policies)",
    sql: `-- RLS Policies: message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "templates_select_manager" ON public.message_templates
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- INSERT (public)
CREATE POLICY "templates_insert_manager" ON public.message_templates
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "templates_update_manager" ON public.message_templates
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "templates_delete_manager" ON public.message_templates
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "messages (8 policies)",
    sql: `-- RLS Policies: messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

-- SELECT (public) - deny anon
CREATE POLICY "messages_deny_anon" ON public.messages
  AS RESTRICTIVE FOR SELECT
  USING (false);

-- SELECT (public)
CREATE POLICY "messages_select_admin_all" ON public.messages
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "messages_select_manager_org" ON public.messages
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND (organization_id IN (SELECT get_user_organizations())));

-- SELECT (public)
CREATE POLICY "messages_select_own" ON public.messages
  AS RESTRICTIVE FOR SELECT
  USING (recipient_id = auth.uid());

-- INSERT (public)
CREATE POLICY "messages_insert_manager" ON public.messages
  AS RESTRICTIVE FOR INSERT
  WITH CHECK ((sender_id = auth.uid()) AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- UPDATE (public)
CREATE POLICY "messages_update_admin_all" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "messages_update_manager_org" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) AND (organization_id IN (SELECT get_user_organizations())))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND (organization_id IN (SELECT get_user_organizations())));

-- UPDATE (public)
CREATE POLICY "messages_update_own" ON public.messages
  AS RESTRICTIVE FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());`,
  },
  {
    table: "notifications (4 policies)",
    sql: `-- RLS Policies: notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Users can view their own notifications" ON public.notifications
  AS RESTRICTIVE FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT (public)
CREATE POLICY "Managers can insert notifications" ON public.notifications
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Users can update their own notifications" ON public.notifications
  AS RESTRICTIVE FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE (public)
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  AS RESTRICTIVE FOR DELETE
  USING (auth.uid() = user_id);`,
  },
  {
    table: "organization_members (4 policies)",
    sql: `-- RLS Policies: organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "org_members_select" ON public.organization_members
  AS RESTRICTIVE FOR SELECT
  USING (user_has_org_access(organization_id) OR has_role(auth.uid(), 'admin'::app_role));

-- INSERT (public)
CREATE POLICY "org_members_insert_owner" ON public.organization_members
  AS RESTRICTIVE FOR INSERT
  WITH CHECK ((user_org_role(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "org_members_update_owner" ON public.organization_members
  AS RESTRICTIVE FOR UPDATE
  USING ((user_org_role(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "org_members_delete_owner" ON public.organization_members
  AS RESTRICTIVE FOR DELETE
  USING ((user_org_role(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])) OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "organizations (4 policies)",
    sql: `-- RLS Policies: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "org_select_members" ON public.organizations
  AS RESTRICTIVE FOR SELECT
  USING (user_has_org_access(id) OR has_role(auth.uid(), 'admin'::app_role));

-- INSERT (public)
CREATE POLICY "org_insert_admin" ON public.organizations
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "org_update_owner" ON public.organizations
  AS RESTRICTIVE FOR UPDATE
  USING ((user_org_role(id) = 'owner'::text) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "org_delete_superadmin" ON public.organizations
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "payments (4 policies)",
    sql: `-- RLS Policies: payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Managers can view all payments" ON public.payments
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "Scholars can view their own payments" ON public.payments
  AS RESTRICTIVE FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT (public)
CREATE POLICY "Managers can insert payments" ON public.payments
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Managers can update payments" ON public.payments
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "profiles (7 policies)",
    sql: `-- RLS Policies: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- SELECT (authenticated)
CREATE POLICY "Profiles: select own" ON public.profiles
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- INSERT (authenticated)
CREATE POLICY "Profiles: insert own" ON public.profiles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SELECT (public)
CREATE POLICY "Profiles: select admin" ON public.profiles
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "Profiles: select manager org-scoped" ON public.profiles
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND (organization_id IN (SELECT get_user_organizations())));

-- SELECT (anon)
CREATE POLICY "deny_anon_select" ON public.profiles
  AS RESTRICTIVE FOR SELECT TO anon
  USING (false);

-- UPDATE (public)
CREATE POLICY "Profiles: update own non-sensitive" ON public.profiles
  AS RESTRICTIVE FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE (public)
CREATE POLICY "Admins can delete profiles" ON public.profiles
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "profiles_sensitive (5 policies)",
    sql: `-- RLS Policies: profiles_sensitive
ALTER TABLE public.profiles_sensitive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_sensitive FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Admins can view sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "Users can view their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR SELECT
  USING (user_id = auth.uid());

-- INSERT (public)
CREATE POLICY "Users can insert their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE (public)
CREATE POLICY "Admins can update sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Users can update their own sensitive data" ON public.profiles_sensitive
  AS RESTRICTIVE FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());`,
  },
  {
    table: "projects (5 policies)",
    sql: `-- RLS Policies: projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Managers can view all projects" ON public.projects
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "Scholars can view their projects" ON public.projects
  AS RESTRICTIVE FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM enrollments
    WHERE ((enrollments.project_id = projects.id) AND (enrollments.user_id = auth.uid()))
  ));

-- INSERT (public)
CREATE POLICY "Managers can insert projects" ON public.projects
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Managers can update projects" ON public.projects
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "Managers can delete projects" ON public.projects
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "reports (7 policies)",
    sql: `-- RLS Policies: reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

-- SELECT (authenticated)
CREATE POLICY "Reports: select admin" ON public.reports
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (authenticated)
CREATE POLICY "Reports: select manager org-scoped" ON public.reports
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND (EXISTS (
    SELECT 1 FROM profiles p
    WHERE ((p.user_id = reports.user_id) AND (p.organization_id IN (SELECT get_user_organizations())))
  )));

-- SELECT (authenticated)
CREATE POLICY "Reports: select own" ON public.reports
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- INSERT (authenticated)
CREATE POLICY "Reports: insert own" ON public.reports
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE (authenticated)
CREATE POLICY "Reports: update admin" ON public.reports
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (authenticated)
CREATE POLICY "Reports: update manager org-scoped" ON public.reports
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND (EXISTS (
    SELECT 1 FROM profiles p
    WHERE ((p.user_id = reports.user_id) AND (p.organization_id IN (SELECT get_user_organizations())))
  )));

-- SELECT (anon)
CREATE POLICY "deny_anon_select" ON public.reports
  AS RESTRICTIVE FOR SELECT TO anon
  USING (false);`,
  },
  {
    table: "thematic_projects (5 policies)",
    sql: `-- RLS Policies: thematic_projects
ALTER TABLE public.thematic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thematic_projects FORCE ROW LEVEL SECURITY;

-- SELECT (public)
CREATE POLICY "Managers can view all thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- SELECT (public)
CREATE POLICY "Scholars can view their thematic project" ON public.thematic_projects
  AS RESTRICTIVE FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM (enrollments e JOIN projects p ON ((e.project_id = p.id)))
    WHERE ((p.thematic_project_id = thematic_projects.id) AND (e.user_id = auth.uid()))
  ));

-- INSERT (public)
CREATE POLICY "Managers can insert thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (public)
CREATE POLICY "Managers can update thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR UPDATE
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE (public)
CREATE POLICY "Admins can delete thematic projects" ON public.thematic_projects
  AS RESTRICTIVE FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));`,
  },
  {
    table: "user_roles (7 policies)",
    sql: `-- RLS Policies: user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- SELECT (authenticated)
CREATE POLICY "Roles: select admin" ON public.user_roles
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (authenticated)
CREATE POLICY "Roles: select manager" ON public.user_roles
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role));

-- SELECT (authenticated)
CREATE POLICY "Roles: select own" ON public.user_roles
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- INSERT (authenticated)
CREATE POLICY "Roles: insert admin only" ON public.user_roles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE (authenticated)
CREATE POLICY "Roles: update admin only" ON public.user_roles
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- DELETE (authenticated)
CREATE POLICY "Roles: delete admin only" ON public.user_roles
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SELECT (anon)
CREATE POLICY "deny_anon_select" ON public.user_roles
  AS RESTRICTIVE FOR SELECT TO anon
  USING (false);`,
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

// Database Functions (Triggers and Business Logic)
const DATABASE_FUNCTIONS = [
  {
    name: "update_updated_at_column",
    description: "Atualiza automaticamente o timestamp 'updated_at' quando um registro é modificado.",
    code: `CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "prevent_bank_fields_edit",
    description: "Impede que bolsistas editem campos de controle bancário (validation_status, locked_for_edit).",
    code: `CREATE OR REPLACE FUNCTION public.prevent_bank_fields_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Se não for gestor/admin, não pode mudar campos de controle
  IF NOT (
    has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  ) THEN
    IF (NEW.validation_status IS DISTINCT FROM OLD.validation_status)
       OR (NEW.locked_for_edit IS DISTINCT FROM OLD.locked_for_edit) THEN
      RAISE EXCEPTION 'Not allowed to change validation fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "validate_project_valor_mensal",
    description: "Valida que o valor mensal de um projeto é sempre positivo.",
    code: `CREATE OR REPLACE FUNCTION public.validate_project_valor_mensal()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.valor_mensal <= 0 THEN
    RAISE EXCEPTION 'valor_mensal deve ser um valor positivo';
  END IF;
  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "encrypt_and_mask_pix_key",
    description: "Encripta a chave PIX com AES-256 e a mascara automaticamente em inserts/updates.",
    code: `CREATE OR REPLACE FUNCTION public.encrypt_and_mask_pix_key()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- If pix_key_masked is being set (from application), use it as the source for encryption
  IF NEW.pix_key_masked IS NOT NULL AND NEW.pix_key_masked <> '' AND 
     (TG_OP = 'INSERT' OR OLD.pix_key_masked IS DISTINCT FROM NEW.pix_key_masked) THEN
    -- Check if the value looks like a masked value (contains ***) - if so, don't re-encrypt
    IF POSITION('***' IN NEW.pix_key_masked) = 0 THEN
      -- This is a new PIX key value, encrypt it and mask it
      NEW.pix_key_encrypted := public.encrypt_pix_key(NEW.pix_key_masked);
      NEW.pix_key_masked := public.mask_pix_key(NEW.pix_key_masked);
    END IF;
  END IF;
  
  -- Ensure pix_key column (plain text) is always NULL to prevent plain text storage
  NEW.pix_key := NULL;
  
  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "notify_new_message",
    description: "Cria notificação e dispara email quando uma nova mensagem é enviada.",
    code: `CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_name text;
BEGIN
  -- Get sender name
  SELECT COALESCE(full_name, 'Gestor') INTO v_sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id
  LIMIT 1;

  -- Insert notification for recipient
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    NEW.recipient_id,
    'Nova Mensagem',
    'Você recebeu uma mensagem de ' || v_sender_name || ': ' || LEFT(NEW.subject, 50),
    'info',
    'message',
    NEW.id
  );

  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "notify_report_status_change",
    description: "Notifica bolsista quando status do relatório muda (aprovado, devolvido, sob análise).",
    code: `CREATE OR REPLACE FUNCTION public.notify_report_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_title text;
  v_message text;
  v_type text;
  v_event_type text;
  v_org_id uuid;
  v_link_url text;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get org_id from the scholar's enrollment -> project -> thematic_project
  SELECT tp.organization_id INTO v_org_id
  FROM public.enrollments e
  JOIN public.projects p ON e.project_id = p.id
  JOIN public.thematic_projects tp ON p.thematic_project_id = tp.id
  WHERE e.user_id = NEW.user_id
  LIMIT 1;

  v_link_url := '/bolsista/perfil';

  -- Determine notification content based on new status
  CASE NEW.status
    WHEN 'approved' THEN
      v_title := 'Relatório Aprovado';
      v_message := 'Seu relatório de ' || NEW.reference_month || ' foi aprovado!';
      v_type := 'success';
      v_event_type := NULL;
    WHEN 'rejected' THEN
      v_title := 'Relatório Devolvido para Ajustes';
      v_message := 'Seu relatório de ' || NEW.reference_month || ' foi devolvido para ajustes.';
      IF NEW.feedback IS NOT NULL AND NEW.feedback <> '' THEN
        v_message := v_message || ' Observações: ' || LEFT(NEW.feedback, 200);
      END IF;
      v_type := 'error';
      v_event_type := 'REPORT_RETURNED';
    WHEN 'under_review' THEN
      v_title := 'Relatório Enviado com Sucesso';
      v_message := 'Seu relatório de ' || NEW.reference_month || ' foi enviado e está em análise.';
      v_type := 'info';
      v_event_type := 'REPORT_SUBMITTED';
    ELSE
      RETURN NEW;
  END CASE;

  -- Insert notification (bell)
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (NEW.user_id, v_title, v_message, v_type, 'report', NEW.id);

  -- Insert inbox message (system)
  INSERT INTO public.messages (recipient_id, sender_id, subject, body, type, event_type, link_url, organization_id)
  VALUES (NEW.user_id, NULL, v_title, v_message, 'SYSTEM', v_event_type, v_link_url, v_org_id);

  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "notify_payment_status_change",
    description: "Notifica bolsista quando status do pagamento muda (liberado, pago, cancelado).",
    code: `CREATE OR REPLACE FUNCTION public.notify_payment_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_title text;
  v_message text;
  v_type text;
  v_org_id uuid;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get org_id
  SELECT tp.organization_id INTO v_org_id
  FROM public.enrollments e
  JOIN public.projects p ON e.project_id = p.id
  JOIN public.thematic_projects tp ON p.thematic_project_id = tp.id
  WHERE e.user_id = NEW.user_id
  LIMIT 1;

  CASE NEW.status
    WHEN 'eligible' THEN
      v_title := 'Pagamento Liberado';
      v_message := 'O pagamento da parcela ' || NEW.installment_number || ' (' || NEW.reference_month || ') foi liberado!';
      v_type := 'success';
    WHEN 'paid' THEN
      v_title := 'Pagamento Efetuado';
      v_message := 'A parcela ' || NEW.installment_number || ' (' || NEW.reference_month || ') foi paga com sucesso!';
      v_type := 'success';
    WHEN 'cancelled' THEN
      v_title := 'Pagamento Cancelado';
      v_message := 'A parcela ' || NEW.installment_number || ' (' || NEW.reference_month || ') foi cancelada.';
      v_type := 'warning';
    ELSE
      RETURN NEW;
  END CASE;

  -- Insert notification (bell)
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (NEW.user_id, v_title, v_message, v_type, 'payment', NEW.id);

  -- Insert inbox message (system)
  INSERT INTO public.messages (recipient_id, sender_id, subject, body, type, event_type, link_url, organization_id)
  VALUES (NEW.user_id, NULL, v_title, v_message, 'SYSTEM', 'PAYMENT_STATUS', '/bolsista/perfil', v_org_id);

  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "queue_system_message_email",
    description: "Enfileira envio de e-mail para mensagens do sistema respeitando configurações da organização.",
    code: `CREATE OR REPLACE FUNCTION public.queue_system_message_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile record;
  v_email_enabled boolean := true;
BEGIN
  IF NEW.type <> 'SYSTEM' THEN
    RETURN NEW;
  END IF;

  SELECT email, full_name INTO v_profile
  FROM public.profiles
  WHERE user_id = NEW.recipient_id
  LIMIT 1;

  IF v_profile IS NULL OR v_profile.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check org email_notifications_enabled column
  IF NEW.organization_id IS NOT NULL THEN
    SELECT o.email_notifications_enabled INTO v_email_enabled
    FROM public.organizations o
    WHERE o.id = NEW.organization_id;
  END IF;

  IF NOT v_email_enabled THEN
    -- Just register in inbox, no email
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-system-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'message_id', NEW.id,
      'recipient_email', v_profile.email,
      'recipient_name', COALESCE(v_profile.full_name, 'Bolsista'),
      'subject', NEW.subject,
      'body', NEW.body
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to queue system email: %', SQLERRM;
    RETURN NEW;
END;
$function$;`,
  },
  {
    name: "update_messages_updated_at",
    description: "Atualiza timestamp de mensagens quando são modificadas.",
    code: `CREATE OR REPLACE FUNCTION public.update_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "handle_new_user",
    description: "Trigger para novos usuários: cria perfil, atribui papel, valida código de convite e registra auditoria.",
    code: `CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role app_role;
  is_seed_admin boolean := false;
  v_invite_code text;
  v_invite_record record;
  v_cpf_clean text;
BEGIN
  -- Check if this is the institutional seed admin email
  IF NEW.email = 'administrativo@icca.org.br' THEN
    assigned_role := 'admin';
    is_seed_admin := true;
  ELSE
    assigned_role := 'scholar';
    
    -- VALIDATE INVITE CODE for non-admin signups
    v_invite_code := NEW.raw_user_meta_data->>'invite_code';
    
    IF v_invite_code IS NULL OR TRIM(v_invite_code) = '' THEN
      RAISE EXCEPTION 'Código de convite é obrigatório para cadastro';
    END IF;
    
    -- Fetch and validate invite code with row lock to prevent race conditions
    SELECT * INTO v_invite_record
    FROM public.invite_codes
    WHERE code = UPPER(TRIM(v_invite_code))
    FOR UPDATE;
    
    IF v_invite_record IS NULL THEN
      RAISE EXCEPTION 'Código de convite inválido: %', v_invite_code;
    END IF;
    
    IF v_invite_record.status != 'active' THEN
      RAISE EXCEPTION 'Código de convite não está ativo: %', v_invite_code;
    END IF;
    
    IF v_invite_record.expires_at IS NOT NULL AND v_invite_record.expires_at < CURRENT_DATE THEN
      UPDATE public.invite_codes SET status = 'expired' WHERE id = v_invite_record.id;
      RAISE EXCEPTION 'Código de convite expirado: %', v_invite_code;
    END IF;
    
    IF v_invite_record.max_uses IS NOT NULL AND v_invite_record.used_count >= v_invite_record.max_uses THEN
      UPDATE public.invite_codes SET status = 'exhausted' WHERE id = v_invite_record.id;
      RAISE EXCEPTION 'Código de convite atingiu limite de usos: %', v_invite_code;
    END IF;
  END IF;

  -- Clean CPF: remove all non-numeric characters
  v_cpf_clean := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'cpf', ''), '[^0-9]', '', 'g');
  IF v_cpf_clean = '' THEN
    v_cpf_clean := NULL;
  END IF;

  -- Create profile with invite code tracking
  INSERT INTO public.profiles (
    user_id, email, full_name, cpf, origin,
    thematic_project_id, partner_company_id, 
    invite_code_used, invite_used_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    v_cpf_clean,
    COALESCE(NEW.raw_user_meta_data->>'origin', 'manual'),
    CASE WHEN NOT is_seed_admin THEN v_invite_record.thematic_project_id ELSE NULL END,
    CASE WHEN NOT is_seed_admin THEN v_invite_record.partner_company_id ELSE NULL END,
    CASE WHEN NOT is_seed_admin THEN v_invite_code ELSE NULL END,
    CASE WHEN NOT is_seed_admin THEN now() ELSE NULL END
  );
  
  -- Assign role based on email check
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  -- Record invite code usage for non-admin users
  IF NOT is_seed_admin THEN
    INSERT INTO public.invite_code_uses (invite_code_id, used_by, used_by_email)
    VALUES (v_invite_record.id, NEW.id, NEW.email);
    
    UPDATE public.invite_codes 
    SET used_count = used_count + 1
    WHERE id = v_invite_record.id;
  END IF;
  
  -- Log seed admin assignment
  IF is_seed_admin THEN
    RAISE LOG '[SEED_ADMIN] Papel Admin Master atribuído automaticamente ao usuário institucional: % (user_id: %)', NEW.email, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;`,
  },
  {
    name: "insert_audit_log",
    description: "Insere registro de auditoria com verificação de autenticação e papel.",
    code: `CREATE OR REPLACE FUNCTION public.insert_audit_log(p_action text, p_entity_type text, p_entity_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_previous_value jsonb DEFAULT NULL::jsonb, p_new_value jsonb DEFAULT NULL::jsonb, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_log_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create audit logs';
  END IF;
  
  -- Verify caller has admin or manager role
  IF NOT (has_role(v_user_id, 'admin'::app_role) OR has_role(v_user_id, 'manager'::app_role)) THEN
    RAISE EXCEPTION 'Only admins and managers can create audit logs';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Insert the audit log
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    details,
    previous_value,
    new_value,
    user_agent
  ) VALUES (
    v_user_id,
    v_user_email,
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_details, '{}'::jsonb),
    p_previous_value,
    p_new_value,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$function$;`,
  },
];

// CREATE TRIGGER Statements
const TRIGGER_STATEMENTS = [
  {
    name: "trg_update_profiles_updated_at",
    table: "profiles",
    description: "Atualiza updated_at na tabela profiles",
    code: `CREATE TRIGGER trg_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();`,
  },
  {
    name: "trg_prevent_bank_fields_edit",
    table: "bank_accounts",
    description: "Impede edição de campos de controle bancário",
    code: `CREATE TRIGGER trg_prevent_bank_fields_edit
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_bank_fields_edit();`,
  },
  {
    name: "trg_validate_project_valor",
    table: "projects",
    description: "Valida valor mensal positivo",
    code: `CREATE TRIGGER trg_validate_project_valor
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.validate_project_valor_mensal();`,
  },
  {
    name: "trg_encrypt_mask_pix",
    table: "bank_accounts",
    description: "Encripta e mascara chave PIX",
    code: `CREATE TRIGGER trg_encrypt_mask_pix
BEFORE INSERT OR UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_and_mask_pix_key();`,
  },
  {
    name: "trg_notify_new_message",
    table: "messages",
    description: "Notifica novo usuário quando mensagem é enviada",
    code: `CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();`,
  },
  {
    name: "trg_notify_report_change",
    table: "reports",
    description: "Notifica bolsista quando relatório muda de status",
    code: `CREATE TRIGGER trg_notify_report_change
AFTER UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_report_status_change();`,
  },
  {
    name: "trg_notify_payment_change",
    table: "payments",
    description: "Notifica bolsista quando pagamento muda de status",
    code: `CREATE TRIGGER trg_notify_payment_change
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.notify_payment_status_change();`,
  },
  {
    name: "trg_queue_system_email",
    table: "messages",
    description: "Enfileira envio de e-mail para mensagens de sistema",
    code: `CREATE TRIGGER trg_queue_system_email
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.queue_system_message_email();`,
  },
  {
    name: "trg_update_messages_timestamp",
    table: "messages",
    description: "Atualiza updated_at em mensagens",
    code: `CREATE TRIGGER trg_update_messages_timestamp
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_messages_updated_at();`,
  },
];

// Vault Configuration
const VAULT_CONFIG = [
  {
    name: "PIX_KEY_ENCRYPTION_KEY",
    description: "Chave de encriptação AES-256 para PIX Keys armazenada no Vault do Supabase. Deve ser uma string aleatória de pelo menos 32 caracteres.",
    code: `-- 1. Gerar uma chave aleatória no SQL (use isto como template):
SELECT encode(gen_random_bytes(32), 'base64') as encryption_key;

-- 2. Copiar a chave gerada acima

-- 3. No Supabase Dashboard, ir para: Settings > Vault > Create a secret
-- - Nome (Name): PIX_KEY_ENCRYPTION_KEY
-- - Valor (Secret): <colar a chave gerada acima>
-- - Clique em Save

-- 4. Verificar se a chave está configurada corretamente:
SELECT decrypted_secret 
FROM vault.decrypted_secrets 
WHERE name = 'PIX_KEY_ENCRYPTION_KEY';

-- 5. Se a query retornar um resultado, a configuração está correta!
-- Nota: Esta query só funciona se você estiver autenticado como admin`,
  },
];

export default function DatabaseSchema() {
  const [activeSection, setActiveSection] = useState<Section>("tables");
  const [selectedTable, setSelectedTable] = useState<string>(SCHEMA[0].name);
  const [selectedFunction, setSelectedFunction] = useState<string>(EDGE_FUNCTION_CODES[0].name);
  const [selectedAuxFunction, setSelectedAuxFunction] = useState<string>(AUXILIARY_FUNCTIONS[0].name);
  const [selectedDbFunction, setSelectedDbFunction] = useState<string>(DATABASE_FUNCTIONS[0].name);
  const [selectedTrigger, setSelectedTrigger] = useState<string>(TRIGGER_STATEMENTS[0].name);
  const [selectedVault, setSelectedVault] = useState<string>(VAULT_CONFIG[0].name);
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
    { id: "database-functions", label: "Database Functions", icon: <Code className="w-4 h-4" /> },
    { id: "triggers", label: "CREATE TRIGGER", icon: <Clock className="w-4 h-4" /> },
    { id: "vault", label: "Vault Config", icon: <Settings className="w-4 h-4" /> },
    { id: "data-migration", label: "📦 Migração de Dados", icon: <HardDrive className="w-4 h-4" /> },
  ];

  const [selectedMigrationScript, setSelectedMigrationScript] = useState(MIGRATION_SCRIPTS[0]?.name || "");

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

        {/* Database Functions Section */}
        {activeSection === "database-functions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Database Functions ({DATABASE_FUNCTIONS.length})</h2>
            </div>
            <p className="text-sm text-muted-foreground">Funções PL/pgSQL para triggers, criptografia, notificações e lógica de negócio</p>

            {/* Function selector */}
            <div className="flex flex-wrap gap-2">
              {DATABASE_FUNCTIONS.map(f => (
                <Badge
                  key={f.name}
                  variant={selectedDbFunction === f.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDbFunction(f.name)}
                >
                  {f.name}
                </Badge>
              ))}
            </div>

            {/* Function detail */}
            {DATABASE_FUNCTIONS.filter(f => f.name === selectedDbFunction).map(f => (
              <Card key={f.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-col">
                      <span className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
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

        {/* CREATE TRIGGER Section */}
        {activeSection === "triggers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">CREATE TRIGGER Statements ({TRIGGER_STATEMENTS.length})</h2>
            </div>
            <p className="text-sm text-muted-foreground">Triggers que vinculam funções a eventos de tabelas (INSERT, UPDATE, DELETE)</p>

            {/* Trigger selector */}
            <div className="flex flex-wrap gap-2">
              {TRIGGER_STATEMENTS.map(t => (
                <Badge
                  key={t.name}
                  variant={selectedTrigger === t.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTrigger(t.name)}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {t.name}
                  </span>
                </Badge>
              ))}
            </div>

            {/* Trigger detail */}
            {TRIGGER_STATEMENTS.filter(t => t.name === selectedTrigger).map(t => (
              <Card key={t.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-col">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {t.name}
                      </span>
                      <p className="text-xs font-normal text-muted-foreground mt-2">{t.description}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">Tabela: <span className="font-bold">{t.table}</span></p>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(t.code, t.name)}
                    >
                      {copiedTable === t.name ? (
                        <><Check className="w-3 h-3" /> Copiado</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copiar</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">
                    {t.code}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vault Configuration Section */}
        {activeSection === "vault" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Vault Configuration</h2>
            </div>
            <p className="text-sm text-muted-foreground">Segredos armazenados no Supabase Vault para criptografia e variáveis sensíveis</p>

            {/* Vault item selector */}
            <div className="flex flex-wrap gap-2">
              {VAULT_CONFIG.map(v => (
                <Badge
                  key={v.name}
                  variant={selectedVault === v.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedVault(v.name)}
                >
                  <span className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    {v.name}
                  </span>
                </Badge>
              ))}
            </div>

            {/* Vault detail */}
            {VAULT_CONFIG.filter(v => v.name === selectedVault).map(v => (
              <Card key={v.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-col">
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        {v.name}
                      </span>
                      <p className="text-xs font-normal text-muted-foreground mt-2">{v.description}</p>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(v.code, v.name)}
                    >
                      {copiedTable === v.name ? (
                        <><Check className="w-3 h-3" /> Copiado</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copiar</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">
                    {v.code}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Data Migration Section */}
        {activeSection === "data-migration" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">📦 Migração de Dados</h2>
            </div>
            <p className="text-sm text-muted-foreground">Scripts SQL de INSERT INTO com dados reais extraídos do banco de dados atual. Ordem de execução respeita integridade referencial.</p>

            {/* Strategy card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Estratégia de Migração
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyToClipboard(DATA_MIGRATION_STRATEGY, 'strategy')}>
                    {copiedTable === 'strategy' ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[40vh] overflow-y-auto">{DATA_MIGRATION_STRATEGY}</pre>
              </CardContent>
            </Card>

            {/* Disable triggers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-destructive" />
                    Desabilitar/Reabilitar Triggers
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyToClipboard(DISABLE_TRIGGERS_SCRIPT, 'triggers-toggle')}>
                    {copiedTable === 'triggers-toggle' ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[30vh] overflow-y-auto">{DISABLE_TRIGGERS_SCRIPT}</pre>
              </CardContent>
            </Card>

            {/* Auth Users */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500" />
                    0. auth.users (Criação de Usuários)
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyToClipboard(AUTH_USERS_MIGRATION, 'auth-users')}>
                    {copiedTable === 'auth-users' ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">{AUTH_USERS_MIGRATION}</pre>
              </CardContent>
            </Card>

            {/* Migration script selector */}
            <h3 className="text-lg font-semibold text-foreground mt-6">Scripts de INSERT por Tabela ({MIGRATION_SCRIPTS.length})</h3>
            <div className="flex flex-wrap gap-2">
              {MIGRATION_SCRIPTS.map(s => (
                <Badge
                  key={s.name}
                  variant={selectedMigrationScript === s.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedMigrationScript(s.name)}
                >
                  {s.name}
                </Badge>
              ))}
            </div>

            {MIGRATION_SCRIPTS.filter(s => s.name === selectedMigrationScript).map(s => (
              <Card key={s.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-primary" />
                        {s.name}
                      </span>
                      <p className="text-xs font-normal text-muted-foreground">{s.description}</p>
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyToClipboard(s.code, s.name)}>
                      {copiedTable === s.name ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[60vh] overflow-y-auto">{s.code}</pre>
                </CardContent>
              </Card>
            ))}

            {/* Verification */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Verificação Pós-Migração
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyToClipboard(VERIFICATION_SCRIPT, 'verification')}>
                    {copiedTable === 'verification' ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap text-foreground max-h-[40vh] overflow-y-auto">{VERIFICATION_SCRIPT}</pre>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}