import { Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export function AdminBanner() {
  const { isAdmin } = useUserRole();

  if (!isAdmin) return null;

  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Shield className="w-4 h-4 text-warning" />
        <span className="text-sm font-medium text-warning">
          Modo Administrador Master — Ações críticas são registradas na trilha de auditoria
        </span>
      </div>
    </div>
  );
}
