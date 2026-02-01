import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export type AuditAction = 
  | "bulk_deactivate"
  | "bulk_delete"
  | "update_cpf"
  | "update_enrollment"
  | "release_payment"
  | "update_user_role"
  | "create_enrollment"
  | "delete_enrollment"
  | "approve_report"
  | "reject_report"
  | "create_project"
  | "update_project"
  | "archive_project"
  | "delete_project"
  | "assign_scholar_to_project";

export type EntityType = 
  | "user"
  | "enrollment"
  | "payment"
  | "report"
  | "user_role"
  | "project";

interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Json;
  previousValue?: Json;
  newValue?: Json;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async ({
    action,
    entityType,
    entityId,
    details,
    previousValue,
    newValue,
  }: AuditLogParams) => {
    if (!user) {
      console.error("[AUDIT] Cannot log action: user not authenticated");
      return { error: new Error("User not authenticated") };
    }

    try {
      const { error } = await supabase.from("audit_logs").insert([{
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        previous_value: previousValue,
        new_value: newValue,
        user_agent: navigator.userAgent,
      }]);

      if (error) {
        console.error("[AUDIT] Failed to log action:", error);
        return { error };
      }

      console.log(`[AUDIT] Logged: ${action} on ${entityType}${entityId ? ` (${entityId})` : ""}`);
      return { error: null };
    } catch (err) {
      console.error("[AUDIT] Unexpected error:", err);
      return { error: err as Error };
    }
  };

  return { logAction };
}
