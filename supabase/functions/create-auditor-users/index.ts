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
    const INVITE_CODE = "ICCA-C4MCMLXN";

    const auditors = [
      {
        email: "o.heringer@tommasi.com.br",
        password: "Otavio123@",
        full_name: "Otávio Arruda Heringer",
        cpf: "00000000001",
      },
      {
        email: "suporte@innovago.app",
        password: "Innovago2016@",
        full_name: "Suporte Innovago",
        cpf: "00000000002",
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
          await supabaseAdmin.auth.admin.updateUserById(userId, { password: auditor.password });
          results.push({ email: auditor.email, status: "existing_updated", user_id: userId });
        } else {
          // Create user with invite code so trigger succeeds
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: auditor.email,
            password: auditor.password,
            email_confirm: true,
            user_metadata: {
              full_name: auditor.full_name,
              cpf: auditor.cpf,
              invite_code: INVITE_CODE,
              origin: "manual",
            },
          });

          if (authError) {
            console.error(`createUser error for ${auditor.email}:`, JSON.stringify(authError));
            results.push({ email: auditor.email, status: "failed", error: authError.message });
            continue;
          }

          userId = authData.user!.id;
          console.log(`User created: ${auditor.email} -> ${userId}`);
          results.push({ email: auditor.email, status: "created", user_id: userId });
        }

        // Change role from scholar to auditor
        // First delete scholar role
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", "scholar");
        
        // Insert auditor role
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "auditor" },
          { onConflict: "user_id,role" }
        );

        // Update profile with org and onboarding complete
        await supabaseAdmin.from("profiles")
          .update({ 
            organization_id: ORG_TOMMASI_ID, 
            onboarding_status: "COMPLETO",
            cpf: null, // clear dummy CPF
          })
          .eq("user_id", userId);

        // Ensure org membership
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
        console.error(`Error for ${auditor.email}:`, err);
        results.push({ email: auditor.email, status: "error", error: String(err) });
      }
    }

    return new Response(JSON.stringify({ results }, null, 2), {
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
