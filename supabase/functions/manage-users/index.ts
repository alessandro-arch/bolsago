import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token for auth check
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Claims error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Request from user:", userId);

    // Check user role
    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar permissões" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = roleData?.role === "admin";
    const isManager = roleData?.role === "manager" || isAdmin;

    if (!isManager) {
      return new Response(
        JSON.stringify({ error: "Apenas gestores podem gerenciar usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { action, userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Lista de usuários inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-action
    if (userIds.includes(userId)) {
      return new Response(
        JSON.stringify({ error: "Você não pode executar esta ação na própria conta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    if (action === "deactivate" || action === "reactivate") {
      // Deactivate/Reactivate users
      const isActive = action === "reactivate";
      console.log(`${action} users:`, userIds);

      for (const targetUserId of userIds) {
        try {
          // Update profile is_active status
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq("user_id", targetUserId);

          if (profileError) {
            console.error(`Error updating profile for ${targetUserId}:`, profileError);
            results.failed.push({ id: targetUserId, error: profileError.message });
            continue;
          }

          // If deactivating, suspend all active enrollments
          if (!isActive) {
            const { error: enrollmentError } = await supabaseAdmin
              .from("enrollments")
              .update({ status: "suspended", updated_at: new Date().toISOString() })
              .eq("user_id", targetUserId)
              .eq("status", "active");

            if (enrollmentError) {
              console.error(`Error suspending enrollments for ${targetUserId}:`, enrollmentError);
              // Don't fail the whole operation, just log
            }
          }

          console.log(`Successfully ${action}d user:`, targetUserId);
          results.success.push(targetUserId);
        } catch (err) {
          console.error(`Unexpected error ${action}ing user ${targetUserId}:`, err);
          results.failed.push({ id: targetUserId, error: String(err) });
        }
      }

      const actionLabel = isActive ? "reativado(s)" : "desativado(s)";
      return new Response(
        JSON.stringify({
          message: `${results.success.length} usuário(s) ${actionLabel} com sucesso`,
          results,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      // Only admins can permanently delete
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Apenas administradores podem excluir usuários permanentemente" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Permanently deleting users:", userIds);

      for (const targetUserId of userIds) {
        try {
          // Check for linked records
          const { data: enrollments } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("user_id", targetUserId)
            .limit(1);

          const { data: payments } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("user_id", targetUserId)
            .limit(1);

          const { data: reports } = await supabaseAdmin
            .from("reports")
            .select("id")
            .eq("user_id", targetUserId)
            .limit(1);

          if ((enrollments && enrollments.length > 0) || 
              (payments && payments.length > 0) || 
              (reports && reports.length > 0)) {
            console.log(`User ${targetUserId} has linked records, cannot delete`);
            results.failed.push({ 
              id: targetUserId, 
              error: "Usuário possui registros vinculados (matrículas, pagamentos ou relatórios). Desative o usuário ao invés de excluir." 
            });
            continue;
          }

          // Delete from user_roles
          await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId);

          // Delete from profiles
          await supabaseAdmin.from("profiles").delete().eq("user_id", targetUserId);

          // Delete from bank_accounts
          await supabaseAdmin.from("bank_accounts").delete().eq("user_id", targetUserId);

          // Delete the auth user
          const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

          if (authDeleteError) {
            console.error("Error deleting auth user", targetUserId, authDeleteError);
            results.failed.push({ id: targetUserId, error: authDeleteError.message });
          } else {
            console.log("Successfully deleted user:", targetUserId);
            results.success.push(targetUserId);
          }
        } catch (err) {
          console.error("Unexpected error deleting user", targetUserId, err);
          results.failed.push({ id: targetUserId, error: String(err) });
        }
      }

      return new Response(
        JSON.stringify({
          message: `${results.success.length} usuário(s) excluído(s) permanentemente`,
          results,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use: deactivate, reactivate ou delete" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
