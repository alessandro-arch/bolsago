import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ORIGINS = [
  "https://sisconnecta.lovable.app",
  "https://id-preview--2b9d72d4-676d-41a6-bf6b-707f4c8b4527.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const generatePasswordResetEmail = (resetUrl: string, logoUrl: string): string => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha | SisConnecta</title>
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
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <div style="display: none; max-height: 0; overflow: hidden;">
    Redefina sua senha do SisConnecta - Sistema de Gestão de Bolsas Institucionais
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <tr>
            <td style="background-color: #003366; border-radius: 8px 8px 0 0; padding: 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${logoUrl}" alt="SisConnecta" style="max-height: 40px; width: auto;" onerror="this.style.display='none'" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 12px; color: #ffffff; opacity: 0.9;">Gestão de Bolsas</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #003366; line-height: 1.3;">
                      Redefinição de Senha
                    </h1>
                  </td>
                  <td width="64" align="right" style="vertical-align: middle;">
                    <div style="width: 56px; height: 56px; background-color: #e6f3ff; border-radius: 50%; text-align: center; line-height: 56px;">
                      <span style="font-size: 28px;">🔐</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <div style="background-color: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                  Olá,
                </p>
                <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
                  Você solicitou a redefinição de senha da sua conta no <strong>SisConnecta</strong>. Clique no botão abaixo para criar uma nova senha segura.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #003366; border-radius: 6px;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <div style="background-color: #e6f3ff; border-left: 4px solid #003366; border-radius: 0 8px 8px 0; padding: 16px 20px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #003366;">
                  Informações de Segurança
                </p>
                <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.5;">
                  <strong>Validade do link:</strong> 1 hora<br />
                  Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá inalterada.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 0; font-size: 12px; color: #003366; word-break: break-all; line-height: 1.5;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px; border-bottom: 1px solid #e8e8e8;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #333333;">
                Atenciosamente,
              </p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #003366;">
                Equipe SisConnecta
              </p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #666666;">
                Sistema de Gestão de Bolsas Institucionais
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #003366; border-radius: 0 0 8px 8px; padding: 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                      Seu parceiro em inovação e conhecimento
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #ffffff; opacity: 0.8; line-height: 1.5;">
                      © ICCA – Instituto de Inovação, Conhecimento e Ciências Aplicadas<br />
                      <a href="https://www.icca.org.br" style="color: #ffffff; text-decoration: underline;">www.icca.org.br</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">
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

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

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

    const finalRedirectTo = redirect_to || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?recovery=true`;
    const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(finalRedirectTo)}`;

    const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/logo-icca.png?v=1`;

    console.log("Sending password reset email to:", user.email);
    console.log("Reset URL:", resetUrl);

    const emailResponse = await resend.emails.send({
      from: "SisConnecta <noreply@bolsaconecta.com.br>",
      to: [user.email],
      subject: "Redefinição de Senha • SisConnecta",
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
