import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UseUserRoleReturn {
  role: AppRole | null;
  loading: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isScholar: boolean;
  hasManagerAccess: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          // Default to scholar if no role found
          setRole("scholar");
        } else {
          setRole(data?.role ?? "scholar");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("scholar");
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isScholar = role === "scholar";
  const hasManagerAccess = isAdmin || isManager;

  return {
    role,
    loading,
    isManager,
    isAdmin,
    isScholar,
    hasManagerAccess,
  };
}
