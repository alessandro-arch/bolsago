import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const generatePasswordResetEmail = (resetUrl: string, logoUrl: string): string => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de senha • ICCA Bolsa Conecta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 32px 40px; border-bottom: 1px solid #E2E8F0;">
              <img src="${logoUrl}" alt="ICCA Bolsa Conecta" style="height: 48px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #1E293B; text-align: center;">
                Redefinição de senha
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; text-align: center;">
                Recebemos uma solicitação para redefinir a senha da sua conta no ICCA Bolsa Conecta.
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #475569; text-align: center;">
                Para criar uma nova senha, clique no botão abaixo:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; transition: background-color 0.2s;">
                      Redefinir senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #F1F5F9; border-radius: 8px;">
                <p style="margin: 0; font-size: 13px; color: #64748B; text-align: center;">
                  Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Você pode ignorar este e-mail com segurança.
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #94A3B8; text-align: center;">
                Por motivos de segurança, este link é válido por tempo limitado.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; color: #64748B; text-align: center;">
                Equipe ICCA Bolsa Conecta
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #94A3B8; text-align: center;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Password reset webhook received:", JSON.stringify(payload, null, 2));

    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = payload;

    if (!user?.email) {
      console.error("No user email provided");
      return new Response(
        JSON.stringify({ error: "No user email provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only process recovery emails
    if (email_action_type !== "recovery") {
      console.log("Not a recovery email, skipping:", email_action_type);
      return new Response(
        JSON.stringify({ message: "Not a recovery email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL not configured");
    }

    // Build the password reset URL
    const finalRedirectTo = redirect_to || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?recovery=true`;
    const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(finalRedirectTo)}`;

    // Logo URL - using the uploaded asset
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/logo-bolsa-conecta.png?v=1`;

    console.log("Sending password reset email to:", user.email);
    console.log("Reset URL:", resetUrl);

    const emailResponse = await resend.emails.send({
      from: "ICCA Bolsa Conecta <noreply@bolsaconecta.com.br>",
      to: [user.email],
      subject: "Redefinição de senha • ICCA Bolsa Conecta",
      html: generatePasswordResetEmail(resetUrl, logoUrl),
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
