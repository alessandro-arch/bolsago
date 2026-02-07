import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Modern email template with refined design
function generateConfirmationEmail(userEmail: string, confirmationUrl: string, logoUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de E-mail | ICCA CONNECTA</title>
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
    Confirme seu e-mail para acessar o ICCA CONNECTA - Sistema de Gestão de Bolsas Institucionais
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Header with gradient accent -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);"></td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px;">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="ICCA - Instituto de Inovação, Conhecimento e Ciências Aplicadas" style="max-width: 200px; height: auto;" />`
                : `<div style="font-size: 28px; font-weight: 800; color: #1e40af; letter-spacing: -0.5px;">ICCA CONNECTA</div>`
              }
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500;">
                Sistema de Gestão de Bolsas Institucionais
              </p>
            </td>
          </tr>

          <!-- Icon -->
          <tr>
            <td align="center" style="padding: 0 40px 16px;">
              <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✉️</span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 0 40px 8px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                Confirme seu e-mail
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding: 0 40px 32px;">
              <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Estamos quase lá! Falta apenas um passo.
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
                  Bem-vindo(a) ao <strong style="color: #1e40af;">ICCA CONNECTA</strong>. Para ativar sua conta e acessar todos os recursos do portal, confirme seu endereço de e-mail clicando no botão abaixo.
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); box-shadow: 0 8px 16px rgba(30, 64, 175, 0.3), 0 4px 8px rgba(30, 64, 175, 0.2);">
                    <a href="${confirmationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                      ✓ Confirmar meu e-mail
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
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #3b82f6; word-break: break-all; line-height: 1.5;">
                ${confirmationUrl}
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
                    <span style="font-size: 18px;">🔒</span>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                      Se você não criou esta conta, ignore este e-mail. O link expira em <strong>1 hora</strong> por segurança.
                    </p>
                  </td>
                </tr>
              </table>
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
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    let data;

    // Try to parse as webhook from Supabase Auth Hook
    try {
      data = JSON.parse(payload);
    } catch {
      console.error('Failed to parse payload as JSON');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Received auth hook payload:', JSON.stringify(data, null, 2));

    const { user, email_data } = data;

    if (!user?.email || !email_data) {
      console.error('Missing required fields in payload');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { token_hash, redirect_to, email_action_type } = email_data;

    console.log(`Processing ${email_action_type} email for: ${user.email}`);

    // Only handle signup confirmation emails
    if (email_action_type !== 'signup' && email_action_type !== 'email_change') {
      console.log(`Skipping email type: ${email_action_type}`);
      return new Response(
        JSON.stringify({ message: 'Email type not handled by this function' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Build confirmation URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const finalRedirectTo = redirect_to || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth`;
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(finalRedirectTo)}`;

    // Logo URL from storage bucket
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/logo-icca.png?v=1`;

    // Generate email HTML
    const html = generateConfirmationEmail(user.email, confirmationUrl, logoUrl);

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'ICCA CONNECTA <noreply@bolsaconecta.com.br>',
      to: [user.email],
      subject: '✓ Confirme seu e-mail • ICCA CONNECTA',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log(`Confirmation email sent successfully to: ${user.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error('Error in send-confirmation-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as { code?: number })?.code || 500;
    return new Response(
      JSON.stringify({
        error: {
          http_code: errorCode,
          message: errorMessage,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
