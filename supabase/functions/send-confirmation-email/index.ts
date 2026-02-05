import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Email template HTML generator with institutional ICCA Bolsa Conecta branding
function generateConfirmationEmail(userEmail: string, confirmationUrl: string, logoUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de E-mail | ICCA Bolsa Conecta</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- HEADER -->
          <tr>
            <td align="center" style="padding:30px 20px 20px;">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="ICCA - Instituto de Inovação, Conhecimento e Ciências Aplicadas" style="max-width:180px; height:auto;" />`
                : `<h2 style="margin:0; color:#1e40af; font-size:24px; font-weight:700;">ICCA Bolsa Conecta</h2>`
              }
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td align="center" style="padding:10px 40px;">
              <h1 style="margin:0; font-size:22px; color:#1f2937;">
                Confirme seu endereço de e-mail
              </h1>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:20px 40px; color:#374151; font-size:15px; line-height:1.6;">
              <p>
                Seja bem-vindo(a) ao <strong>ICCA Bolsa Conecta</strong>.
              </p>
              <p>
                Para concluir seu cadastro e garantir o acesso seguro ao portal,
                é necessário confirmar o seu endereço de e-mail:
              </p>
              <p style="font-weight:bold; color:#111827;">
                ${userEmail}
              </p>
              <p>
                Basta clicar no botão abaixo para validar sua conta.
              </p>
            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td align="center" style="padding:20px 40px 30px;">
              <a 
                href="${confirmationUrl}"
                target="_blank"
                style="
                  background-color:#1e40af;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 32px;
                  border-radius:6px;
                  font-size:15px;
                  font-weight:bold;
                  display:inline-block;
                "
              >
                Confirmar e-mail
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 40px; background-color:#f9fafb; font-size:13px; color:#6b7280; line-height:1.5;">
              <p>
                Caso você não tenha solicitado este cadastro, basta ignorar esta mensagem.
              </p>
              <p style="margin-top:15px;">
                Atenciosamente,<br />
                <strong>ICCA – Instituto de Inovação, Conhecimento e Ciências Aplicadas</strong>
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

    // Get logo URL from environment
    const logoUrl = Deno.env.get('EMAIL_LOGO_URL');

    // Generate email HTML
    const html = generateConfirmationEmail(user.email, confirmationUrl, logoUrl);

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'ICCA Bolsa Conecta <noreply@bolsaconecta.com.br>',
      to: [user.email],
      subject: 'Confirmação do seu e-mail • ICCA Bolsa Conecta',
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
