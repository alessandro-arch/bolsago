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
  <title>Redefinição de senha • ICCA CONNECTA</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Preheader text (hidden but shows in email preview) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Redefina sua senha do ICCA CONNECTA - Sistema de Gestão de Bolsas Institucionais
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Header with gradient accent -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);"></td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px;">
              <img src="${logoUrl}" alt="ICCA CONNECTA" style="max-width: 200px; height: auto;" />
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500;">
                Sistema de Gestão de Bolsas Institucionais
              </p>
            </td>
          </tr>

          <!-- Icon -->
          <tr>
            <td align="center" style="padding: 0 40px 16px;">
              <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🔐</span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 0 40px 8px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                Redefinição de senha
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding: 0 40px 32px;">
              <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Recebemos uma solicitação para redefinir sua senha.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #475569; line-height: 1.7;">
                  Olá! 👋
                </p>
                <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.7;">
                  Você solicitou a redefinição de senha da sua conta no <strong style="color: #1e40af;">ICCA CONNECTA</strong>. Clique no botão abaixo para criar uma nova senha segura.
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3), 0 4px 8px rgba(220, 38, 38, 0.2);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                      🔑 Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td align="center" style="padding: 0 40px 32px;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #ef4444; word-break: break-all; line-height: 1.5;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);"></div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 18px;">⚠️</span>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                      <strong style="color: #475569;">Importante:</strong> Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá inalterada.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Timer Notice -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 12px 16px; border: 1px solid #f59e0b;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="24" valign="top">
                      <span style="font-size: 14px;">⏱️</span>
                    </td>
                    <td style="padding-left: 8px;">
                      <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 500;">
                        Este link é válido por <strong>1 hora</strong> por motivos de segurança.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b; text-align: center;">
                Atenciosamente,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #334155; text-align: center;">
                Equipe ICCA CONNECTA
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; text-align: center;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
                © ICCA – Instituto de Inovação, Conhecimento e Ciências Aplicadas<br />
                <a href="https://www.icca.org.br" style="color: #3b82f6; text-decoration: none;">www.icca.org.br</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Email Tips -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                E-mail não está na caixa de entrada? Verifique sua pasta de spam.
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
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/logo-icca.png?v=1`;

    console.log("Sending password reset email to:", user.email);
    console.log("Reset URL:", resetUrl);

    const emailResponse = await resend.emails.send({
      from: "ICCA CONNECTA <noreply@bolsaconecta.com.br>",
      to: [user.email],
      subject: "🔑 Redefinição de senha • ICCA CONNECTA",
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
