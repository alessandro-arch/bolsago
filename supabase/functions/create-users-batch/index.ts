import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!roleData || (roleData.role !== "admin" && roleData.role !== "manager")) {
      return new Response(JSON.stringify({ error: "Apenas administradores/gestores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { users, inviteCode } = await req.json() as {
      users: Array<{ email: string; cpf: string; full_name?: string }>;
      inviteCode: string;
    };

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "Lista de usuários vazia" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!inviteCode) {
      return new Response(JSON.stringify({ error: "Código de convite obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate invite code
    const { data: inviteRecord, error: inviteError } = await supabaseAdmin
      .from("invite_codes")
      .select("*")
      .eq("code", inviteCode.toUpperCase().trim())
      .single();

    if (inviteError || !inviteRecord) {
      return new Response(JSON.stringify({ error: "Código de convite inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      success: [] as Array<{ email: string; user_id: string }>,
      failed: [] as Array<{ email: string; error: string }>,
    };

    for (const user of users) {
      try {
        const cpfClean = user.cpf.replace(/\D/g, "");
        const tempPassword = `Temp@${Date.now()}#${Math.random().toString(36).slice(2, 8)}`;

        // Create auth user with auto-confirm
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name || user.email.split("@")[0],
            cpf: cpfClean,
            invite_code: inviteCode,
            origin: "manual",
          },
        });

        if (authError) {
          console.error(`Error creating user ${user.email}:`, authError);
          results.failed.push({ email: user.email, error: authError.message });
          continue;
        }

        if (!authData.user) {
          results.failed.push({ email: user.email, error: "Falha ao criar usuário" });
          continue;
        }

        // The handle_new_user trigger should have created the profile.
        // Verify it was created:
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("user_id", authData.user.id)
          .single();

        if (!profile) {
          // Trigger may have failed, create profile manually
          const { error: profileError } = await supabaseAdmin.from("profiles").insert({
            user_id: authData.user.id,
            email: user.email,
            full_name: user.full_name || user.email.split("@")[0],
            cpf: cpfClean,
            origin: "manual",
            thematic_project_id: inviteRecord.thematic_project_id,
            partner_company_id: inviteRecord.partner_company_id,
            invite_code_used: inviteCode,
            invite_used_at: new Date().toISOString(),
          });

          if (profileError) {
            console.error(`Error creating profile for ${user.email}:`, profileError);
          }

          // Also ensure role is set
          await supabaseAdmin.from("user_roles").upsert({
            user_id: authData.user.id,
            role: "scholar",
          }, { onConflict: "user_id,role" });
        }

        // Send password reset email so user can set their own password
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: user.email,
        });

        if (resetError) {
          console.error(`Error sending reset for ${user.email}:`, resetError);
        }

        results.success.push({ email: user.email, user_id: authData.user.id });

        console.log(`Successfully created user: ${user.email}`);
      } catch (err) {
        console.error(`Unexpected error for ${user.email}:`, err);
        results.failed.push({ email: user.email, error: String(err) });
      }
    }

    // Update invite code used_count
    if (results.success.length > 0) {
      await supabaseAdmin
        .from("invite_codes")
        .update({ used_count: inviteRecord.used_count + results.success.length })
        .eq("id", inviteRecord.id);
    }

    return new Response(JSON.stringify({
      message: `${results.success.length} conta(s) criada(s) com sucesso`,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
