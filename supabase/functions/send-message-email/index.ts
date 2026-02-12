import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const ALLOWED_ORIGINS = [
  "https://bolsago.lovable.app",
  "https://www.innovago.app",
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

function generateMessageEmail(
  recipientName: string,
  subject: string,
  body: string,
  senderName: string,
  logoUrl: string
): string {
  const bodyHtml = body.replace(/\n/g, '<br/>');
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} | BolsaGO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${subject} - BolsaGO
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; border-radius: 8px 8px 0 0; padding: 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${logoUrl}" alt="InnovaGO" style="max-height: 40px; width: auto;" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 12px; color: #ffffff; opacity: 0.9;">BolsaGO</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #003366; line-height: 1.3;">
                      Nova Mensagem
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666;">
                      De: <strong>${senderName}</strong>
                    </p>
                  </td>
                  <td width="64" align="right" style="vertical-align: middle;">
                    <div style="width: 56px; height: 56px; background-color: #e6f3ff; border-radius: 50%; text-align: center; line-height: 56px;">
                      <span style="font-size: 28px;">💬</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Subject -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 16px;">
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #333333;">
                ${subject}
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <div style="background-color: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 24px;">
                <p style="margin: 0; font-size: 15px; color: #333333; line-height: 1.7;">
                  ${bodyHtml}
                </p>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #003366; border-radius: 6px;">
                    <a href="https://bolsago.lovable.app/bolsista/mensagens" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                      Ver no BolsaGO
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #003366; border-radius: 0 0 8px 8px; padding: 24px 32px;">
              <p style="margin: 0; font-size: 12px; color: #ffffff; opacity: 0.8; line-height: 1.5;">
                © InnovaGO – Sistema de Gestão de Bolsas em Pesquisa e Desenvolvimento<br />
                <a href="https://www.innovago.app" style="color: #ffffff; text-decoration: underline;">www.innovago.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the sender is authenticated and is a manager/admin
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Use service role to check role and get profiles
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isManagerOrAdmin = roles?.some(r => r.role === 'manager' || r.role === 'admin');
    if (!isManagerOrAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: only managers/admins can send messages' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { recipient_id, subject, body } = await req.json();

    if (!recipient_id || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: recipient_id, subject, body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get recipient profile
    const { data: recipientProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', recipient_id)
      .single();

    if (!recipientProfile?.email) {
      return new Response(JSON.stringify({ error: 'Recipient not found or has no email' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get sender profile
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const senderName = senderProfile?.full_name || 'Equipe de Gestão';
    const recipientName = recipientProfile.full_name || 'Bolsista';

    // Insert message into database
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id,
        subject,
        body,
      });

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send email
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/logo-innovago.png?v=1`;
    const html = generateMessageEmail(recipientName, subject, body, senderName, logoUrl);

    const { error: emailError } = await resend.emails.send({
      from: 'BolsaGO <noreply@bolsaconecta.com.br>',
      to: [recipientProfile.email],
      subject: `${subject} • BolsaGO`,
      html,
    });

    if (emailError) {
      console.error('Resend error (message saved but email failed):', emailError);
      // Message was saved, just email failed — return partial success
      return new Response(
        JSON.stringify({ success: true, email_sent: false, warning: 'Message saved but email delivery failed' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Message sent to ${recipientProfile.email} by ${senderName}`);

    return new Response(
      JSON.stringify({ success: true, email_sent: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error('Error in send-message-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
