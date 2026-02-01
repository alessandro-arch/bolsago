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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação do seu e-mail • ICCA Bolsa Conecta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="ICCA Bolsa Conecta" width="150" style="display: block; margin: 0 auto;">`
                : `<h2 style="margin: 0; color: #2563eb; font-size: 24px; font-weight: 700;">ICCA Bolsa Conecta</h2>`
              }
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; color: #1e293b; font-size: 22px; font-weight: 600; line-height: 1.4; text-align: center;">
                Seja bem-vindo(a) ao ICCA Bolsa Conecta
              </h1>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 15px; line-height: 1.7; text-align: center;">
                Recebemos sua solicitação de cadastro e, para concluir o processo, precisamos confirmar seu endereço de e-mail:
              </p>
              
              <p style="margin: 16px 0 24px; padding: 14px 20px; background-color: #f1f5f9; border-radius: 6px; color: #1e293b; font-size: 15px; font-weight: 500; text-align: center;">
                ${userEmail}
              </p>
              
              <p style="margin: 0 0 32px; color: #475569; font-size: 15px; line-height: 1.7; text-align: center;">
                Para isso, clique no botão abaixo para confirmar seu e-mail.
              </p>
              
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${confirmationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                      Confirmar e-mail
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6; text-align: center;">
                Caso você não tenha realizado este cadastro, nenhuma ação é necessária. Você pode desconsiderar esta mensagem com segurança.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 500; text-align: center;">
                Equipe ICCA Bolsa Conecta
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                Este e-mail foi enviado automaticamente. Por favor, não responda.
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
