import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ORG_TOMMASI_ID = "a1111111-1111-1111-1111-111111111111";

    const auditors = [
      {
        email: "o.heringer@tommasi.com.br",
        password: "Otavio123@",
        full_name: "Otávio Arruda Heringer",
      },
      {
        email: "suporte@innovago.app",
        password: "Innovago2016@",
        full_name: "Suporte Innovago",
      },
    ];

    const results: Array<{ email: string; status: string; user_id?: string; error?: string }> = [];

    for (const auditor of auditors) {
      try {
        // Check if user already exists
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email === auditor.email);

        let userId: string;

        if (existing) {
          userId = existing.id;
          // Update password
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: auditor.password,
          });
          results.push({ email: auditor.email, status: "existing_updated", user_id: userId });
        } else {
          // Create user WITHOUT triggering handle_new_user (autoconfirm, no invite_code in metadata)
          // The trigger will fail because no invite_code, so we need to handle that
          // Strategy: create user with a dummy invite code won't work. Instead, create via raw approach.
          
          // Actually, the trigger on auth.users WILL fire. We need to temporarily work around it.
          // Best approach: create user with metadata that makes trigger think it's seed admin? No.
          // Alternative: create user and catch the trigger error, then create profile manually.
          
          // Let's try creating - if trigger fails, the auth user might still be created
          // but with Supabase, if trigger raises exception, the INSERT is rolled back.
          
          // So we need a different approach: use raw SQL to temporarily disable the trigger,
          // or modify the trigger to allow auditor creation.
          
          // Safest: use supabaseAdmin to run SQL that creates the user
          // But we can't insert into auth.users directly.
          
          // Best approach: The trigger checks for invite_code. Let's pass a special flag.
          // We'll create the user with metadata origin = 'auditor_provision' and modify nothing.
          // Since trigger WILL raise exception, let's just catch it and use a workaround.
          
          // Actually, let's try with signUp admin API - if trigger fails, user won't be created.
          // So let's first temporarily handle this by creating with admin API which may bypass triggers.
          
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: auditor.email,
            password: auditor.password,
            email_confirm: true,
            user_metadata: {
              full_name: auditor.full_name,
              origin: "auditor_provision",
            },
          });

          if (authError) {
            // If trigger blocked it, we need another approach
            results.push({ email: auditor.email, status: "failed", error: authError.message });
            continue;
          }

          userId = authData.user!.id;
          results.push({ email: auditor.email, status: "created", user_id: userId });
        }

        // Ensure profile exists
        const { data: profileExists } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!profileExists) {
          await supabaseAdmin.from("profiles").insert({
            user_id: userId,
            email: auditor.email,
            full_name: auditor.full_name,
            organization_id: ORG_TOMMASI_ID,
            origin: "auditor_provision",
            onboarding_status: "COMPLETO",
          });
        } else {
          // Update org if needed
          await supabaseAdmin.from("profiles")
            .update({ organization_id: ORG_TOMMASI_ID })
            .eq("user_id", userId);
        }

        // Ensure auditor role
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "auditor" },
          { onConflict: "user_id,role" }
        );

        // Ensure organization membership
        const { data: memberExists } = await supabaseAdmin
          .from("organization_members")
          .select("id")
          .eq("user_id", userId)
          .eq("organization_id", ORG_TOMMASI_ID)
          .single();

        if (!memberExists) {
          await supabaseAdmin.from("organization_members").insert({
            organization_id: ORG_TOMMASI_ID,
            user_id: userId,
            role: "auditor",
          });
        }
      } catch (err) {
        results.push({ email: auditor.email, status: "error", error: String(err) });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
