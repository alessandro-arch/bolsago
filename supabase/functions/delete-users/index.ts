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

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || roleData?.role !== "admin") {
      console.error("Role check failed:", roleError, roleData);
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem excluir usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user IDs to delete from request body
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Lista de usuários inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (userIds.includes(userId)) {
      return new Response(
        JSON.stringify({ error: "Você não pode excluir a própria conta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting users:", userIds);

    // Create admin client for user deletion
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const targetUserId of userIds) {
      try {
        // Delete from user_roles first
        const { error: rolesDeleteError } = await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId);

        if (rolesDeleteError) {
          console.error("Error deleting roles for", targetUserId, rolesDeleteError);
        }

        // Delete from profiles
        const { error: profileDeleteError } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("user_id", targetUserId);

        if (profileDeleteError) {
          console.error("Error deleting profile for", targetUserId, profileDeleteError);
        }

        // Delete from enrollments (if any)
        const { error: enrollmentsDeleteError } = await supabaseAdmin
          .from("enrollments")
          .delete()
          .eq("user_id", targetUserId);

        if (enrollmentsDeleteError) {
          console.error("Error deleting enrollments for", targetUserId, enrollmentsDeleteError);
        }

        // Delete from payments (if any)
        const { error: paymentsDeleteError } = await supabaseAdmin
          .from("payments")
          .delete()
          .eq("user_id", targetUserId);

        if (paymentsDeleteError) {
          console.error("Error deleting payments for", targetUserId, paymentsDeleteError);
        }

        // Delete from reports (if any)
        const { error: reportsDeleteError } = await supabaseAdmin
          .from("reports")
          .delete()
          .eq("user_id", targetUserId);

        if (reportsDeleteError) {
          console.error("Error deleting reports for", targetUserId, reportsDeleteError);
        }

        // Delete from bank_accounts (if any)
        const { error: bankDeleteError } = await supabaseAdmin
          .from("bank_accounts")
          .delete()
          .eq("user_id", targetUserId);

        if (bankDeleteError) {
          console.error("Error deleting bank accounts for", targetUserId, bankDeleteError);
        }

        // Finally delete the auth user
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
        message: `${results.success.length} usuário(s) excluído(s) com sucesso`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
