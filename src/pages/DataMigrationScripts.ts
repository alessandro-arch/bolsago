// =============================================
// DATA MIGRATION SCRIPTS - Extracted 2026-02-12
// =============================================

export const DATA_MIGRATION_STRATEGY = `-- =============================================
-- ESTRATÉGIA DE MIGRAÇÃO DE DADOS
-- =============================================
--
-- ORDEM DE EXECUÇÃO (respeita integridade referencial):
--   1. auth.users (via Supabase Admin API - ver seção específica)
--   2. organizations
--   3. profiles (depende de auth.users + organizations)
--   4. profiles_sensitive (depende de auth.users)
--   5. user_roles (depende de auth.users)
--   6. organization_members (depende de auth.users + organizations)
--   7. thematic_projects (depende de organizations)
--   8. projects (depende de thematic_projects)
--   9. invite_codes (depende de thematic_projects + organizations)
--  10. invite_code_uses (depende de invite_codes + auth.users)
--  11. enrollments (depende de auth.users + projects)
--  12. reports (depende de auth.users)
--  13. payments (depende de auth.users + enrollments + reports)
--  14. bank_accounts (depende de auth.users)
--  15. grant_terms (depende de auth.users)
--  16. message_templates (independente)
--  17. messages (depende de auth.users + organizations)
--  18. notifications (depende de auth.users)
--  19. institutional_documents (depende de auth.users)
--  20. audit_logs (depende de auth.users)
--
-- ⚠️ IMPORTANTE:
--   - Desabilitar triggers ANTES de inserir dados para evitar
--     efeitos colaterais (notificações, emails, etc.)
--   - Reabilitar triggers APÓS concluir todas as inserções
--   - Desabilitar RLS temporariamente durante a migração
--     usando Service Role Key ou executando como superuser
--
-- PROCEDIMENTO:
--   1. Executar scripts de schema (tabelas, enums, funções)
--   2. Desabilitar triggers (usar USER, não ALL):
--      ALTER TABLE reports DISABLE TRIGGER USER;
--      ALTER TABLE payments DISABLE TRIGGER USER;
--      ALTER TABLE messages DISABLE TRIGGER USER;
--      ALTER TABLE bank_accounts DISABLE TRIGGER USER;
--   3. Executar scripts de INSERT (nesta ordem)
--   4. Reabilitar triggers:
--      ALTER TABLE reports ENABLE TRIGGER USER;
--      ALTER TABLE payments ENABLE TRIGGER USER;
--      ALTER TABLE messages ENABLE TRIGGER USER;
--      ALTER TABLE bank_accounts ENABLE TRIGGER USER;
--   5. Verificar contagem de registros
`;

export const AUTH_USERS_MIGRATION = `-- =============================================
-- AUTH.USERS - Migração de Usuários
-- =============================================
--
-- ⚠️ NÃO É POSSÍVEL inserir diretamente na tabela auth.users via SQL.
-- A abordagem correta é usar a Supabase Admin API (supabase.auth.admin).
--
-- Utilize o seguinte script em uma Edge Function ou script Node.js
-- com a Service Role Key:
--
-- const { createClient } = require('@supabase/supabase-js');
-- const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
--   auth: { autoRefreshToken: false, persistSession: false }
-- });
--
-- const users = [
--   {
--     id: '3e893529-c8f5-4807-af00-4a9897aa444b',
--     email: 'administrativo@icca.org.br',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'Administrativo ICCA' }
--   },
--   {
--     id: '190f52bb-2a3d-4a63-abcb-853f638ffd81',
--     email: 'alessandro.uvv@gmail.com',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'Alessandro Coutinho Ramos', cpf: '03498290630' }
--   },
--   {
--     id: '0c133d5b-a822-4594-8ee0-f50ef8779bac',
--     email: 'barauna2@gmail.com',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'barauna2', cpf: '22019534819' }
--   },
--   {
--     id: '22ded811-7482-4a95-9443-69907ae37bc5',
--     email: 'madsonpz@gmail.com',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'Madson Poltronieri Zanoni', cpf: '10422719765' }
--   },
--   {
--     id: 'f7fc26a3-5348-4426-a486-5b67dd563e97',
--     email: 'paulo.filgueiras@ufes.br',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'paulo.filgueiras', cpf: '09586612783' }
--   },
--   {
--     id: '55214dcb-af81-49de-b3ec-d79b24842d7a',
--     email: 'folligabi@gmail.com',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'Gabriely Silveira Folli', cpf: '14795239762' }
--   },
--   {
--     id: 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd',
--     email: 'alessandro@icca.org.br',
--     password: 'DEFINIR_SENHA_SEGURA',
--     email_confirm: true,
--     user_metadata: { full_name: 'Alessandro Coutinho', cpf: '03498290630' }
--   }
-- ];
--
-- for (const user of users) {
--   const { data, error } = await supabase.auth.admin.createUser({
--     email: user.email,
--     password: user.password,
--     email_confirm: user.email_confirm,
--     user_metadata: user.user_metadata,
--     // O id será gerado automaticamente. Para preservar o id original,
--     // pode ser necessário inserir diretamente via SQL como superuser:
--   });
--   if (error) console.error('Erro ao criar:', user.email, error);
--   else console.log('Criado:', user.email, data.user.id);
-- }
--
-- ⚠️ PRESERVAÇÃO DE IDs:
-- Para manter os IDs originais, é necessário inserir diretamente
-- na tabela auth.users como superuser (via SQL no Dashboard Supabase):
--
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', '3e893529-c8f5-4807-af00-4a9897aa444b', 'authenticated', 'authenticated', 'administrativo@icca.org.br',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Administrativo ICCA"}',
   '2026-02-01 03:49:11.9926+00', now()),
  ('00000000-0000-0000-0000-000000000000', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'authenticated', 'authenticated', 'alessandro.uvv@gmail.com',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Alessandro Coutinho Ramos","cpf":"03498290630"}',
   '2026-02-01 04:21:36.001112+00', now()),
  ('00000000-0000-0000-0000-000000000000', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'authenticated', 'authenticated', 'barauna2@gmail.com',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"barauna2","cpf":"22019534819"}',
   '2026-02-09 14:16:13.509151+00', now()),
  ('00000000-0000-0000-0000-000000000000', '22ded811-7482-4a95-9443-69907ae37bc5', 'authenticated', 'authenticated', 'madsonpz@gmail.com',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Madson Poltronieri Zanoni","cpf":"10422719765"}',
   '2026-02-09 14:16:13.998203+00', now()),
  ('00000000-0000-0000-0000-000000000000', 'f7fc26a3-5348-4426-a486-5b67dd563e97', 'authenticated', 'authenticated', 'paulo.filgueiras@ufes.br',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"paulo.filgueiras","cpf":"09586612783"}',
   '2026-02-09 14:16:14.349352+00', now()),
  ('00000000-0000-0000-0000-000000000000', '55214dcb-af81-49de-b3ec-d79b24842d7a', 'authenticated', 'authenticated', 'folligabi@gmail.com',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Gabriely Silveira Folli","cpf":"14795239762"}',
   '2026-02-09 14:19:31.232784+00', now()),
  ('00000000-0000-0000-0000-000000000000', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'authenticated', 'authenticated', 'alessandro@icca.org.br',
   crypt('DEFINIR_SENHA_SEGURA', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Alessandro Coutinho","cpf":"03498290630"}',
   '2026-02-10 17:46:41.6022+00', now())
ON CONFLICT (id) DO NOTHING;

-- Criar identidades para cada usuário (necessário para login funcionar):
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id, jsonb_build_object('sub', id::text, 'email', email), 'email', id::text, now(), created_at, now()
FROM auth.users
WHERE id IN (
  '3e893529-c8f5-4807-af00-4a9897aa444b',
  '190f52bb-2a3d-4a63-abcb-853f638ffd81',
  '0c133d5b-a822-4594-8ee0-f50ef8779bac',
  '22ded811-7482-4a95-9443-69907ae37bc5',
  'f7fc26a3-5348-4426-a486-5b67dd563e97',
  '55214dcb-af81-49de-b3ec-d79b24842d7a',
  'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd'
)
ON CONFLICT DO NOTHING;
`;

export const MIGRATION_SCRIPTS: { name: string; description: string; order: number; code: string }[] = [
  {
    name: "1. organizations",
    description: "Organizações (multi-tenant) - 2 registros",
    order: 1,
    code: `INSERT INTO public.organizations (id, name, slug, is_active, email_notifications_enabled, settings, created_at, updated_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Tommasi', 'icca', true, true, '{"default":true}', '2026-02-07 18:45:43.40092+00', '2026-02-09 22:10:26.533946+00'),
  ('b2222222-2222-2222-2222-222222222222', 'Organização Teste', 'org-teste', true, true, '{}', '2026-02-07 19:13:16.398992+00', '2026-02-07 19:13:16.398992+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "2. profiles",
    description: "Perfis de usuários - 7 registros",
    order: 2,
    code: `INSERT INTO public.profiles (id, user_id, email, full_name, cpf, phone, avatar_url, institution, academic_level, lattes_url, origin, onboarding_status, is_active, organization_id, thematic_project_id, partner_company_id, invite_code_used, invite_used_at, created_at, updated_at) VALUES
  ('9a65a4a1-2747-4706-82b5-fa6a2fa6962f', '3e893529-c8f5-4807-af00-4a9897aa444b', 'administrativo@icca.org.br', 'Administrativo ICCA', NULL, NULL, NULL, NULL, NULL, NULL, 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', NULL, NULL, NULL, NULL, '2026-02-01 03:49:11.9926+00', '2026-02-07 18:45:43.40092+00'),
  ('4a120ac7-355f-423d-aeaa-0b9cdb00c523', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'alessandro.uvv@gmail.com', 'Alessandro Coutinho Ramos', '03498290630', '27981525655', '190f52bb-2a3d-4a63-abcb-853f638ffd81/avatar.png', 'Universidade Vila Velha', 'pos_doutorado', 'http://lattes.cnpq.br/8921776090757789', 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', NULL, NULL, NULL, NULL, '2026-02-01 04:21:36.001112+00', '2026-02-07 18:45:43.40092+00'),
  ('ff46a13c-489f-4207-a3d7-fe44216bc94d', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'barauna2@gmail.com', 'barauna2', '22019534819', NULL, NULL, NULL, NULL, NULL, 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'ICCA-C4MCMLXN', '2026-02-09 14:16:13.509151+00', '2026-02-09 14:16:13.509151+00', '2026-02-09 15:49:38.162431+00'),
  ('e6695bec-07ff-4331-8884-eacead5f07be', '22ded811-7482-4a95-9443-69907ae37bc5', 'madsonpz@gmail.com', 'Madson Poltronieri Zanoni', '10422719765', '(27) 99602-3802', NULL, 'UFES', 'doutorado', 'http://lattes.cnpq.br/1356579004620543', 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'ICCA-C4MCMLXN', '2026-02-09 14:16:13.998203+00', '2026-02-09 14:16:13.998203+00', '2026-02-09 21:40:40.858387+00'),
  ('b651da8e-f8f6-4bbf-8dda-b16807a0f191', 'f7fc26a3-5348-4426-a486-5b67dd563e97', 'paulo.filgueiras@ufes.br', 'paulo.filgueiras', '09586612783', NULL, NULL, NULL, NULL, NULL, 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'ICCA-C4MCMLXN', '2026-02-09 14:16:14.349352+00', '2026-02-09 14:16:14.349352+00', '2026-02-09 15:49:38.162431+00'),
  ('45f3d8d8-9b5b-45c8-8624-2953f7581bd1', '55214dcb-af81-49de-b3ec-d79b24842d7a', 'folligabi@gmail.com', 'Gabriely Silveira Folli', '14795239762', '(27) 99523-5705', NULL, 'Ufes', 'pos_doutorado', 'http://lattes.cnpq.br/1256230443856795', 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'ICCA-C4MCMLXN', '2026-02-09 14:19:31.232784+00', '2026-02-09 14:19:31.232784+00', '2026-02-09 20:39:12.323622+00'),
  ('ebaa9c73-0e5c-461c-ae62-dfac83a62d29', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'alessandro@icca.org.br', 'Alessandro Coutinho', '03498290630', NULL, NULL, NULL, NULL, NULL, 'manual', 'AGUARDANDO_ATRIBUICAO', true, 'a1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'ICCA-C4MCMLXN', '2026-02-10 17:46:41.6022+00', '2026-02-10 17:46:41.6022+00', '2026-02-10 17:53:18.938682+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "3. profiles_sensitive",
    description: "Dados sensíveis de perfis - 1 registro",
    order: 3,
    code: `INSERT INTO public.profiles_sensitive (id, user_id, cpf, phone, created_at, updated_at) VALUES
  ('5799446c-f667-42fa-afba-76055bbfa94e', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '03498290630', '27981525655', '2026-02-01 04:21:36.001112+00', '2026-02-01 23:44:40.326865+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "4. user_roles",
    description: "Papéis dos usuários (RBAC) - 8 registros",
    order: 4,
    code: `INSERT INTO public.user_roles (id, user_id, role) VALUES
  ('db3f07c8-5234-48fb-9c6f-3e7d2584fefa', '3e893529-c8f5-4807-af00-4a9897aa444b', 'admin'),
  ('f3fdef8a-312b-48b7-a830-daa67f8f7aff', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'admin'),
  ('3a7334f3-9dec-404c-a2bc-4d75544b8d48', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'scholar'),
  ('2ba62fb3-07ce-42d7-ac36-f6dcc44cf7f3', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'scholar'),
  ('ad807460-a8ed-469b-9236-10a1c4cfc20b', '22ded811-7482-4a95-9443-69907ae37bc5', 'scholar'),
  ('16af44ca-a156-4c87-aa8f-74ef14521d39', '55214dcb-af81-49de-b3ec-d79b24842d7a', 'scholar'),
  ('2579e85c-0407-4ebf-ba03-c164bc1b4124', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'scholar'),
  ('8d413fca-7153-4f43-82cd-4a07cc01c0f2', 'f7fc26a3-5348-4426-a486-5b67dd563e97', 'scholar')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "5. organization_members",
    description: "Membros das organizações - 7 registros",
    order: 5,
    code: `INSERT INTO public.organization_members (id, organization_id, user_id, role, created_at, updated_at) VALUES
  ('8dbcbf50-3a85-4418-9db5-6969caee8206', 'a1111111-1111-1111-1111-111111111111', '3e893529-c8f5-4807-af00-4a9897aa444b', 'owner', '2026-02-07 18:45:43.40092+00', '2026-02-07 18:45:43.40092+00'),
  ('7a24b6ae-7034-4b73-9b55-29556f476120', 'a1111111-1111-1111-1111-111111111111', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'member', '2026-02-07 18:45:43.40092+00', '2026-02-07 18:45:43.40092+00'),
  ('240ffaf3-e371-42f4-9bea-97994344de5f', 'a1111111-1111-1111-1111-111111111111', '11523cbb-c8ac-461e-a76b-e7d8fbb93928', 'member', '2026-02-07 18:45:43.40092+00', '2026-02-07 18:45:43.40092+00'),
  ('093461fe-b45c-4482-bbc3-c9da7c66fb4b', 'a1111111-1111-1111-1111-111111111111', '56275e88-2c36-448a-9f03-ec459ec0eb82', 'member', '2026-02-07 18:45:43.40092+00', '2026-02-07 18:45:43.40092+00'),
  ('195af7a9-acbf-48f4-be24-ef10a0632104', 'b2222222-2222-2222-2222-222222222222', '3e893529-c8f5-4807-af00-4a9897aa444b', 'owner', '2026-02-07 19:13:16.398992+00', '2026-02-07 19:13:16.398992+00'),
  ('732db14f-4693-4581-a81b-61aa8aaa1b4d', 'a1111111-1111-1111-1111-111111111111', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'admin', '2026-02-10 17:53:18.938682+00', '2026-02-10 17:53:18.938682+00'),
  ('971618b1-f9eb-4bbc-b4ee-5baab874a8f7', 'b2222222-2222-2222-2222-222222222222', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'admin', '2026-02-10 17:53:18.938682+00', '2026-02-10 17:53:18.938682+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "6. thematic_projects",
    description: "Projetos temáticos - 3 registros",
    order: 6,
    code: `INSERT INTO public.thematic_projects (id, title, sponsor_name, status, observations, organization_id, start_date, end_date, created_at, updated_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Desenvolvimento e a aplicação de métodos quimiométricos para a análise multivariada de dados clínicos e instrumentais, uma iniciativa de alta relevância científica e tecnológica.', 'LABORATÓRIO TOMMASI', 'active', NULL, 'a1111111-1111-1111-1111-111111111111', '2026-01-01', '2028-12-31', '2026-02-05 21:11:24.286221+00', '2026-02-07 18:45:43.40092+00'),
  ('b0000000-0000-0000-0000-000000000001', 'Projeto da Organização Teste', 'Financiador Teste B', 'active', NULL, 'b2222222-2222-2222-2222-222222222222', NULL, NULL, '2026-02-07 19:13:16.398992+00', '2026-02-07 19:13:16.398992+00'),
  ('6f2194a1-686e-456d-9dad-2a7b077e88e1', 'Animais Terapeutas', 'BANESTES', 'active', NULL, 'a1111111-1111-1111-1111-111111111111', NULL, NULL, '2026-02-10 18:10:19.461209+00', '2026-02-10 18:10:19.461209+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "7. projects",
    description: "Subprojetos - 5 registros",
    order: 7,
    code: `INSERT INTO public.projects (id, code, title, orientador, coordenador_tecnico_icca, modalidade_bolsa, valor_mensal, status, observacoes, thematic_project_id, start_date, end_date, created_at, updated_at) VALUES
  ('acf827a8-3759-4972-916c-988229d02d3e', '001-2026TOM', 'Construção de modelos multivariados para estimativa de parâmetros clínicos', 'Valerio Garrone Barauna', NULL, 'Cientista Sênior', 5000, 'active', NULL, 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2027-12-31', '2026-02-01 18:58:03.274292+00', '2026-02-09 19:35:15.548841+00'),
  ('db2d450b-1285-436c-8a69-0b0940cf827c', '002-2026TOM', 'Desenvolvimento de modelos quimiométricos baseados em FTIR-MIR para estimativa de parâmetros clínicos em sangue com aplicação de transferência de calibração', 'Madson Poltronieri Zanoni', 'Alessandro Coutinho ', 'Desenvolvimento Científico e Tecnológico (Nível C)', 4500, 'active', NULL, 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2027-12-31', '2026-02-01 18:58:03.547024+00', '2026-02-09 20:06:42.615401+00'),
  ('6a3b9ea6-fb32-4adf-b22a-4321330f2d72', '003-2026TOM', 'Aplicação de Métodos de Quimiometria e Bioespectroscopia em Dados Clínicos', 'Paulo Roberto Filgueiras', NULL, 'Cientista Sênior', 5500, 'active', NULL, 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2027-12-31', '2026-02-01 18:58:03.8054+00', '2026-02-09 17:23:59.436858+00'),
  ('1a78c34b-3b2f-4503-9781-532e492b4588', '004-2026TOM', 'Determinação automatizada de propriedades clínicas a partir de machine learning e infravermelho médio', 'Gabriely Silveira folli', 'Alessandro Coutinho ', 'Produtividade em Pesquisa', 5000, 'active', NULL, 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2027-12-31', '2026-02-01 18:58:04.057473+00', '2026-02-09 20:07:03.687766+00'),
  ('2776a57f-ad44-4eb1-88b0-918463014990', '005-2026TOM', 'Micorrizas arbusculares', 'Alessandro Coutinho Ramos', 'Alessandro Coutinho ', 'Cientista Sênior', 5000, 'active', NULL, 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2028-01-01', '2026-02-01 18:58:04.322724+00', '2026-02-10 00:09:47.40524+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "8. invite_codes",
    description: "Códigos de convite - 3 registros",
    order: 8,
    code: `INSERT INTO public.invite_codes (id, code, thematic_project_id, partner_company_id, organization_id, created_by, status, max_uses, used_count, expires_at, created_at) VALUES
  ('60aa2175-52f5-4ade-a5ef-20724e5938a6', 'ICCA-GJ8T9BYA', '8187e530-567f-4386-895d-8449c9f9171d', '91c1b6f1-2e18-4616-b469-7146ecb50542', 'a1111111-1111-1111-1111-111111111111', '3e893529-c8f5-4807-af00-4a9897aa444b', 'disabled', 1, 0, NULL, '2026-02-05 21:32:42.723352+00'),
  ('bad52dea-dca2-42a0-849b-351e661c90a8', 'ICCA-C4MCMLXN', 'a0000000-0000-0000-0000-000000000001', 'dc00be95-762e-4030-a293-f924dd894200', 'a1111111-1111-1111-1111-111111111111', '3e893529-c8f5-4807-af00-4a9897aa444b', 'active', 10, 7, '2026-02-19', '2026-02-06 18:45:51.643548+00'),
  ('6f264a9a-63ff-43c5-9f39-bce9ab98d545', 'ICCA-DDCLP4P7', 'a0000000-0000-0000-0000-000000000001', '1ee9f89c-3d08-4a80-b256-4c4f6aababe0', 'a1111111-1111-1111-1111-111111111111', '3e893529-c8f5-4807-af00-4a9897aa444b', 'disabled', 1, 0, NULL, '2026-02-07 19:12:25.515124+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "9. invite_code_uses",
    description: "Uso dos códigos de convite - 7 registros",
    order: 9,
    code: `INSERT INTO public.invite_code_uses (id, invite_code_id, used_by, used_by_email, used_at) VALUES
  ('405193e2-bafc-4717-9000-5302967b693b', 'bad52dea-dca2-42a0-849b-351e661c90a8', '56275e88-2c36-448a-9f03-ec459ec0eb82', 'teste.email.design@example.com', '2026-02-07 16:35:08.773877+00'),
  ('27d92709-a32a-47a4-95dd-bd119c7f86f7', 'bad52dea-dca2-42a0-849b-351e661c90a8', '0ae2feef-512e-4514-b83b-0b93ef4de7ed', 'testenovo2026@example.com', '2026-02-09 13:55:28.724769+00'),
  ('86fdaafe-8cf3-4b04-beb5-251b0a92f6e4', 'bad52dea-dca2-42a0-849b-351e661c90a8', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'barauna2@gmail.com', '2026-02-09 14:16:13.509151+00'),
  ('733a5fe0-0db6-4b52-851d-f3bd0c9f3205', 'bad52dea-dca2-42a0-849b-351e661c90a8', '22ded811-7482-4a95-9443-69907ae37bc5', 'madsonpz@gmail.com', '2026-02-09 14:16:13.998203+00'),
  ('c58a9d43-74b1-4552-8f20-2cc44742795f', 'bad52dea-dca2-42a0-849b-351e661c90a8', 'f7fc26a3-5348-4426-a486-5b67dd563e97', 'paulo.filgueiras@ufes.br', '2026-02-09 14:16:14.349352+00'),
  ('ca1ae0ba-13a7-4dca-b24b-0abf2217d043', 'bad52dea-dca2-42a0-849b-351e661c90a8', '55214dcb-af81-49de-b3ec-d79b24842d7a', 'folligabi@gmail.com', '2026-02-09 14:19:31.232784+00'),
  ('363600d4-746a-44d3-89b2-807755195e81', 'bad52dea-dca2-42a0-849b-351e661c90a8', 'b7eceac9-2d5a-4915-b9bf-9d3be8dcadbd', 'alessandro@icca.org.br', '2026-02-10 17:46:41.6022+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "10. enrollments",
    description: "Vínculos bolsista-projeto - 5 registros",
    order: 10,
    code: `INSERT INTO public.enrollments (id, user_id, project_id, modality, grant_value, start_date, end_date, total_installments, status, observations, created_at, updated_at) VALUES
  ('cd09aa1c-5d2a-4193-8369-9db5a292ba4d', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '2776a57f-ad44-4eb1-88b0-918463014990', 'ict', 5500.00, '2026-01-05', '2027-12-01', 24, 'active', NULL, '2026-02-01 20:24:18.781381+00', '2026-02-01 20:24:18.781381+00'),
  ('64a3960f-1aa9-47be-8995-5048d5f48c95', '22ded811-7482-4a95-9443-69907ae37bc5', 'db2d450b-1285-436c-8a69-0b0940cf827c', 'dct_c', 4500.00, '2026-01-05', '2027-12-31', 24, 'active', NULL, '2026-02-09 16:33:52.688669+00', '2026-02-09 16:33:52.688669+00'),
  ('97d6a5c4-85b3-423c-8227-151b0b4bbf24', 'f7fc26a3-5348-4426-a486-5b67dd563e97', '6a3b9ea6-fb32-4adf-b22a-4321330f2d72', 'senior', 5500.00, '2026-01-05', '2027-12-31', 24, 'active', NULL, '2026-02-09 17:22:26.513089+00', '2026-02-09 17:22:26.513089+00'),
  ('ad9ce5b0-2dfe-4a02-a9dc-91865515ace8', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'acf827a8-3759-4972-916c-988229d02d3e', 'senior', 5000.00, '2026-01-05', '2027-12-31', 24, 'active', NULL, '2026-02-09 19:36:08.584847+00', '2026-02-09 19:36:08.584847+00'),
  ('7623ad6a-7a06-4470-b78c-f537e74fc386', '55214dcb-af81-49de-b3ec-d79b24842d7a', '1a78c34b-3b2f-4503-9781-532e492b4588', 'prod', 5000.00, '2026-01-05', '2027-12-31', 24, 'active', NULL, '2026-02-09 19:37:01.75588+00', '2026-02-09 19:37:01.75588+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "11. reports",
    description: "Relatórios mensais - 6 registros",
    order: 11,
    code: `INSERT INTO public.reports (id, user_id, reference_month, installment_number, file_url, file_name, status, observations, feedback, reviewed_by, reviewed_at, resubmission_deadline, submitted_at, created_at, updated_at) VALUES
  ('5e63d279-7311-4119-9282-2ee806963f76', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '2026-01', 1, '190f52bb-2a3d-4a63-abcb-853f638ffd81/2026-01/v1.pdf', 'Contrato Editora Lattice - Crossover Science.pdf', 'approved', NULL, NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-05 19:47:13.402+00', NULL, '2026-02-05 19:45:20.2341+00', '2026-02-05 19:45:20.2341+00', '2026-02-05 19:47:13.571777+00'),
  ('19c642a4-9226-406a-a9bb-cd9ad17bea08', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '2026-02', 2, '190f52bb-2a3d-4a63-abcb-853f638ffd81/2026-02/v1.pdf', 'DECLARACAO_DE_INEXISTENCIA_DE_VEDACOES_assinado-2.pdf', 'approved', NULL, NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-05 19:46:35.466+00', NULL, '2026-02-05 19:45:50.870456+00', '2026-02-05 19:45:50.870456+00', '2026-02-05 19:46:35.640903+00'),
  ('ec238f90-cab2-4e8f-b8c1-22b876980ca3', '22ded811-7482-4a95-9443-69907ae37bc5', '2026-01', 1, '22ded811-7482-4a95-9443-69907ae37bc5/2026-01/v1.pdf', 'Relatorio_Tecnico.pdf', 'approved', 'Relatório referente ao mês de janeiro/2026', NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 21:17:01.542+00', NULL, '2026-02-09 17:48:05.948991+00', '2026-02-09 17:48:05.948991+00', '2026-02-09 21:17:02.055421+00'),
  ('bca3aa8a-0d74-4b32-b35b-b3e26cd00f97', 'f7fc26a3-5348-4426-a486-5b67dd563e97', '2026-01', 1, 'f7fc26a3-5348-4426-a486-5b67dd563e97/2026-01/v1.pdf', 'RELATÓRIO TESTE.pdf', 'approved', NULL, NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 22:36:19.274+00', NULL, '2026-02-09 22:31:52.359469+00', '2026-02-09 22:31:52.359469+00', '2026-02-09 22:36:19.467212+00'),
  ('1267a97c-555d-41a5-8e93-c2eb08f2e5c5', '55214dcb-af81-49de-b3ec-d79b24842d7a', '2026-01', 1, '55214dcb-af81-49de-b3ec-d79b24842d7a/2026-01/v1.pdf', 'RELATÓRIO TESTE.pdf', 'approved', NULL, NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 22:36:14.029+00', NULL, '2026-02-09 22:33:48.525129+00', '2026-02-09 22:33:48.525129+00', '2026-02-09 22:36:14.215348+00'),
  ('a8ba96c1-306e-4572-bf70-75a1dc1b848c', '0c133d5b-a822-4594-8ee0-f50ef8779bac', '2026-01', 1, '0c133d5b-a822-4594-8ee0-f50ef8779bac/2026-01/v1.pdf', 'RELATÓRIO TESTE.pdf', 'approved', NULL, NULL, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 22:36:08.412+00', NULL, '2026-02-09 22:34:52.423407+00', '2026-02-09 22:34:52.423407+00', '2026-02-09 22:36:08.63389+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "12. payments",
    description: "Pagamentos (parcelas) - script extenso com todas as parcelas",
    order: 12,
    code: `-- Pagamentos do enrollment cd09aa1c (Alessandro - 24 parcelas)
INSERT INTO public.payments (id, user_id, enrollment_id, installment_number, reference_month, amount, status, paid_at, receipt_url, report_id, created_at, updated_at) VALUES
  ('db1de31c-0cd1-43ea-8440-2c9c33c73a02', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 1, '2026-01', 5500.00, 'paid', '2026-02-06 03:07:41.469+00', NULL, '5e63d279-7311-4119-9282-2ee806963f76', '2026-02-01 20:24:19.023351+00', '2026-02-06 03:07:41.77425+00'),
  ('367120df-f1cb-4980-8896-dc067fa97d1f', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 2, '2026-02', 5500.00, 'paid', '2026-02-06 03:07:31.414+00', '190f52bb-2a3d-4a63-abcb-853f638ffd81/2026-02_367120df-f1cb-4980-8896-dc067fa97d1f.pdf', '19c642a4-9226-406a-a9bb-cd9ad17bea08', '2026-02-04 16:38:52.90414+00', '2026-02-06 17:36:31.924037+00'),
  ('6b790a5e-5b68-4e2c-903c-2c8e6e1a4247', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 3, '2026-03', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('ec21a3c0-0772-4761-93ba-0c38c14aa906', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 4, '2026-04', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('977b68bb-03b6-479e-a207-75196c3cfef9', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 5, '2026-05', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('6d3f244b-1069-4e27-8594-8605cb3b03da', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 6, '2026-06', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('fdbdc29f-f0ba-4457-a6ea-a1135fee8e42', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 7, '2026-07', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('9728796e-bdfc-466b-b4df-b794528868d5', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 8, '2026-08', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('453c18b7-d395-40d5-991c-f3ef44f9a74f', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 9, '2026-09', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('f575a416-d292-4ed4-b656-f3074bf3e93b', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 10, '2026-10', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('8233d9c0-79d5-4fc1-9a3c-4c7070785e5f', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 11, '2026-11', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('c246b5f8-95ea-4190-95dc-59515249f694', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 12, '2026-12', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('e9f952c0-a100-40a9-911e-63938c31598a', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 13, '2027-01', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('db421a83-e6e1-424c-b1de-6e7d62ae65a0', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 14, '2027-02', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('6d8372a2-a55b-4c4c-b3c8-f3d81f1857d4', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 15, '2027-03', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('6d2f43fe-5424-426b-94d0-233c06c2ac3c', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 16, '2027-04', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('f8576079-0d1c-438b-8a03-ec2969bb5d43', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 17, '2027-05', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('c150d5fa-157c-4acb-9bfd-109ec00cd13b', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 18, '2027-06', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('12f38c06-3124-4624-8470-5551eca43c4d', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 19, '2027-07', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('d46eab67-e3ef-4b2a-b3e3-4f22d9a8eeec', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 20, '2027-08', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('d38532a6-7513-461f-9e9f-54e984a757ce', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 21, '2027-09', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('a3013dfe-11c0-4a93-97a2-0cd7bbb2986a', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 22, '2027-10', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('478ba146-6d4c-4d1c-b259-dd4873c1591e', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 23, '2027-11', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00'),
  ('e5374c60-53be-4ffc-9f1e-3babe5214b44', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'cd09aa1c-5d2a-4193-8369-9db5a292ba4d', 24, '2027-12', 5500.00, 'pending', NULL, NULL, NULL, '2026-02-04 16:38:52.90414+00', '2026-02-04 16:38:52.90414+00')
ON CONFLICT (id) DO NOTHING;

-- Pagamentos do enrollment 64a3960f (Madson - 1 parcela paga)
INSERT INTO public.payments (id, user_id, enrollment_id, installment_number, reference_month, amount, status, paid_at, receipt_url, report_id, created_at, updated_at) VALUES
  ('7b2566d4-56e2-44ed-9860-1e6cdb5a858e', '22ded811-7482-4a95-9443-69907ae37bc5', '64a3960f-1aa9-47be-8995-5048d5f48c95', 1, '2026-01', 4500.00, 'paid', '2026-02-09 19:42:27.433+00', NULL, 'ec238f90-cab2-4e8f-b8c1-22b876980ca3', '2026-02-09 16:33:53.126738+00', '2026-02-09 21:52:37.290675+00')
ON CONFLICT (id) DO NOTHING;

-- Pagamentos do enrollment 97d6a5c4 (Paulo - 1 parcela paga)
INSERT INTO public.payments (id, user_id, enrollment_id, installment_number, reference_month, amount, status, paid_at, receipt_url, report_id, created_at, updated_at) VALUES
  ('160217cc-852b-4958-b0ef-6bada8e9dd2b', 'f7fc26a3-5348-4426-a486-5b67dd563e97', '97d6a5c4-85b3-423c-8227-151b0b4bbf24', 1, '2026-01', 5500.00, 'paid', '2026-02-09 22:37:13.079+00', NULL, 'bca3aa8a-0d74-4b32-b35b-b3e26cd00f97', '2026-02-09 17:22:26.848918+00', '2026-02-09 22:37:13.234571+00')
ON CONFLICT (id) DO NOTHING;

-- Pagamentos do enrollment ad9ce5b0 (Barauna - 1 parcela paga)
INSERT INTO public.payments (id, user_id, enrollment_id, installment_number, reference_month, amount, status, paid_at, receipt_url, report_id, created_at, updated_at) VALUES
  ('e4966f28-d8a2-41a0-9bd9-c5a3de0c7e91', '0c133d5b-a822-4594-8ee0-f50ef8779bac', 'ad9ce5b0-2dfe-4a02-a9dc-91865515ace8', 1, '2026-01', 5000.00, 'paid', '2026-02-09 22:36:48.129+00', NULL, 'a8ba96c1-306e-4572-bf70-75a1dc1b848c', '2026-02-09 19:36:08.971991+00', '2026-02-09 22:36:48.288249+00')
ON CONFLICT (id) DO NOTHING;

-- Pagamentos do enrollment 7623ad6a (Gabriely - 1 paga + 23 pending)
INSERT INTO public.payments (id, user_id, enrollment_id, installment_number, reference_month, amount, status, paid_at, receipt_url, report_id, created_at, updated_at) VALUES
  ('65b88568-923c-4143-adb6-33157e085781', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 1, '2026-01', 5000.00, 'paid', '2026-02-09 22:37:00.55+00', NULL, '1267a97c-555d-41a5-8e93-c2eb08f2e5c5', '2026-02-09 19:37:02.066859+00', '2026-02-09 22:37:00.725091+00'),
  ('12761397-046d-4eee-820e-569c46a86217', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 6, '2026-06', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('0d94820e-4f41-4621-9789-8fc586907a96', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 7, '2026-07', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('6984ce25-a4ad-4bf8-87ca-29c7b81430b4', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 8, '2026-08', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('613a79ad-ab49-47bc-a855-da231e1483bc', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 9, '2026-09', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('fd4a742a-d67a-4bfa-965d-1173bddd574b', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 10, '2026-10', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('347030e1-ff0b-4538-b231-a84551ab7867', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 11, '2026-11', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('a409c3dc-e3ab-484b-8c81-3bec4206681b', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 12, '2026-12', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('443e17d8-5766-48f4-93d6-637489d1343e', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 13, '2027-01', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('7931d880-645c-49db-b701-1816732c442e', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 14, '2027-02', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('550ed75b-1843-4509-941e-f823ed2a12fd', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 15, '2027-03', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('7974756f-a12c-4bbc-a52d-e90135fa0b21', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 16, '2027-04', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('78aec552-1026-4ea8-b217-20cd98e1144a', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 17, '2027-05', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('77456785-a6cc-40e1-b244-6ed3768a41b5', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 18, '2027-06', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('8d90586f-021f-47d5-8142-e770c144af9c', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 19, '2027-07', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('5cebd673-3fc1-4e37-bf9b-3b0732f3fbfa', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 20, '2027-08', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('84c820f9-cecc-4dc8-9b85-cb46ffec810a', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 21, '2027-09', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('fa508150-df1f-46df-b227-a5b2f7554817', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 22, '2027-10', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('6bfb92a9-26be-4a55-848e-30f721db68b4', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 23, '2027-11', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00'),
  ('d44bf351-cbb7-4ac7-ab30-8e5571faefe9', '55214dcb-af81-49de-b3ec-d79b24842d7a', '7623ad6a-7a06-4470-b78c-f537e74fc386', 24, '2027-12', 5000.00, 'pending', NULL, NULL, NULL, '2026-02-09 21:37:19.861897+00', '2026-02-09 21:37:19.861897+00')
ON CONFLICT (id) DO NOTHING;

-- ⚠️ NOTA: As parcelas restantes dos enrollments de Paulo (97d6a5c4)
-- e Barauna (ad9ce5b0) também possuem ~23 parcelas pendentes cada.
-- Os scripts acima incluem apenas as parcelas já existentes no banco.
-- Para gerar as parcelas faltantes, utilize a lógica de criação de
-- parcelas do sistema após a migração.`
  },
  {
    name: "13. bank_accounts",
    description: "Dados bancários - 3 registros (com criptografia PIX via trigger)",
    order: 13,
    code: `-- ⚠️ IMPORTANTE: NÃO desabilite triggers do bank_accounts!
-- O trigger encrypt_and_mask_pix_key DEVE estar ativo para criptografar as chaves PIX.
-- Pré-requisito: a variável PIX_KEY_ENCRYPTION_KEY deve estar configurada no Vault.
--
-- ESTRATÉGIA:
-- 1. Coloque a chave PIX original no campo pix_key_masked (sem ***)
-- 2. O trigger detecta que não contém '***' e automaticamente:
--    - Criptografa em pix_key_encrypted (AES-256)
--    - Mascara o valor em pix_key_masked
--    - Define pix_key = NULL (segurança)
-- 3. Para chaves já mascaradas (contendo ***), o trigger preserva como está
--
-- ⚠️ Para as chaves PIX dos bolsistas Madson e Barauna, os valores originais
-- foram perdidos (só temos a versão mascarada). Será necessário que eles
-- recadastrem a chave PIX no novo ambiente, ou obtenha os valores originais
-- e substitua abaixo.

-- Desabilitar APENAS o trigger de prevenção de edição (não o de criptografia)
-- ALTER TABLE public.bank_accounts DISABLE TRIGGER trg_prevent_bank_fields_edit;

INSERT INTO public.bank_accounts (id, user_id, bank_name, bank_code, agency, account_number, account_type, pix_key_masked, validation_status, locked_for_edit, validated_by, validated_at, notes_gestor, created_at, updated_at) VALUES
  ('b1a801f6-1328-4cc3-85ec-b5da0738483d', '190f52bb-2a3d-4a63-abcb-853f638ffd81', 'Banco do Brasil', '', '3028', '0111597', 'Conta Corrente', '03498290630', 'validated', true, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-01 23:02:26.14+00', NULL, '2026-02-01 22:08:08.730776+00', '2026-02-01 23:02:26.366745+00'),
  ('c451119b-d333-4e54-bd77-8f1c37db0a30', '22ded811-7482-4a95-9443-69907ae37bc5', 'Nubank', '', '0001', '24152878', 'Conta Corrente', '10*******65', 'validated', true, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 16:29:18.627+00', NULL, '2026-02-09 16:00:01.189012+00', '2026-02-09 16:29:18.850845+00'),
  ('c460d486-9b45-4fd2-89ab-91351c6c6167', '55214dcb-af81-49de-b3ec-d79b24842d7a', 'Banco do Brasil', '', '31933', '294950', 'Conta Corrente', '14*******62', 'validated', true, '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 21:02:39.087+00', NULL, '2026-02-09 20:36:05.753377+00', '2026-02-09 21:02:39.408788+00')
ON CONFLICT (id) DO NOTHING;

-- ALTER TABLE public.bank_accounts ENABLE TRIGGER trg_prevent_bank_fields_edit;`
  },
  {
    name: "14. grant_terms",
    description: "Termos de outorga - 4 registros",
    order: 14,
    code: `INSERT INTO public.grant_terms (id, user_id, file_url, file_name, file_size, signed_at, uploaded_by, uploaded_at, created_at, updated_at) VALUES
  ('b573da71-09be-4bb9-8eac-aea906bbb829', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '190f52bb-2a3d-4a63-abcb-853f638ffd81/termo-outorga.pdf', 'GABRIELY - TERMO DE OUTORGA E ACEITAÇÃO DE BOLSA pdf-D4Sign.pdf', 746611, '2026-06-05', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-06 18:01:54.827412+00', '2026-02-06 18:01:54.827412+00', '2026-02-06 18:01:54.827412+00'),
  ('f9fe4ddb-5b10-4b0e-84a7-2aa878704f2d', '22ded811-7482-4a95-9443-69907ae37bc5', '22ded811-7482-4a95-9443-69907ae37bc5/termo-outorga.pdf', 'MADSON - TERMO DE OUTORGA E ACEITAÇÃO DE BOLSA pdf-D4Sign.pdf', 746967, '2026-02-09', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 16:35:32.793668+00', '2026-02-09 16:35:32.793668+00', '2026-02-09 16:35:32.793668+00'),
  ('383f9f41-b577-4784-8ade-f26ada2df008', '0c133d5b-a822-4594-8ee0-f50ef8779bac', '0c133d5b-a822-4594-8ee0-f50ef8779bac/termo-outorga.pdf', 'VALÉRIO - TERMO DE OUTORGA E ACEITAÇÃO DE BOLSA pdf-D4Sign.pdf', 745484, '2026-01-05', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 19:38:11.433262+00', '2026-02-09 19:38:11.433262+00', '2026-02-09 19:38:11.433262+00'),
  ('8a914c34-9c2c-436d-812f-0ef7c97c26fb', '55214dcb-af81-49de-b3ec-d79b24842d7a', '55214dcb-af81-49de-b3ec-d79b24842d7a/termo-outorga.pdf', 'GABRIELY - TERMO DE OUTORGA E ACEITAÇÃO DE BOLSA pdf-D4Sign.pdf', 746611, '2026-01-05', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 19:38:43.772639+00', '2026-02-09 19:38:43.772639+00', '2026-02-09 19:38:43.772639+00')
ON CONFLICT (id) DO NOTHING;`
  },
  {
    name: "15. message_templates",
    description: "Templates de mensagem - 5 registros (sem HTML template completo por tamanho)",
    order: 15,
    code: `INSERT INTO public.message_templates (id, name, subject, body, category, is_default, created_by, organization_id, created_at, updated_at) VALUES
  ('9cc90a8f-dcf2-49f2-9ba6-9a79fd87fa8c', 'Lembrete de Relatório', 'Lembrete: Envio de Relatório Mensal', E'Prezado(a) bolsista,\\n\\nLembramos que o prazo para envio do relatório mensal está se aproximando. Por favor, acesse a plataforma BolsaGO e envie seu relatório o mais breve possível.\\n\\nEm caso de dúvidas, entre em contato conosco.\\n\\nAtenciosamente,\\nEquipe de Gestão', 'lembrete', false, '00000000-0000-0000-0000-000000000000', NULL, '2026-02-12 00:56:00.092452+00', '2026-02-12 00:56:00.092452+00'),
  ('778c7d8a-a5b7-47eb-84ee-41ae21fb0a94', 'Pendência Bancária', 'Ação Necessária: Dados Bancários Pendentes', E'Prezado(a) bolsista,\\n\\nIdentificamos que seus dados bancários ainda estão pendentes de validação. Para que o pagamento da sua bolsa seja processado, é necessário que você atualize ou confirme suas informações bancárias na plataforma BolsaGO.\\n\\nAtenciosamente,\\nEquipe de Gestão', 'pendencia', false, '00000000-0000-0000-0000-000000000000', NULL, '2026-02-12 00:56:00.092452+00', '2026-02-12 00:56:00.092452+00'),
  ('b9326185-e5a1-4b17-9011-516abaabe97a', 'Relatório Aprovado', 'Seu Relatório Foi Aprovado!', E'Prezado(a) bolsista,\\n\\nTemos o prazer de informar que seu relatório mensal foi aprovado com sucesso. O pagamento correspondente será processado em breve.\\n\\nParabéns pelo trabalho e continue assim!\\n\\nAtenciosamente,\\nEquipe de Gestão', 'aprovacao', false, '00000000-0000-0000-0000-000000000000', NULL, '2026-02-12 00:56:00.092452+00', '2026-02-12 00:56:00.092452+00'),
  ('740b6583-4a82-40f3-a2be-afd62d392c06', 'Boas-vindas', 'Bem-vindo(a) ao BolsaGO!', E'Prezado(a) bolsista,\\n\\nSeja bem-vindo(a) à plataforma BolsaGO! Estamos felizes em tê-lo(a) conosco.\\n\\nAtravés da plataforma, você poderá acompanhar sua bolsa, enviar relatórios mensais e consultar seus pagamentos.\\n\\nSe precisar de ajuda, não hesite em entrar em contato.\\n\\nAtenciosamente,\\nEquipe de Gestão', 'onboarding', false, '00000000-0000-0000-0000-000000000000', NULL, '2026-02-12 00:56:00.092452+00', '2026-02-12 00:56:00.092452+00')
ON CONFLICT (id) DO NOTHING;

-- ⚠️ O template institucional HTML (id: 91663560-...) é muito extenso.
-- Recomenda-se recriá-lo manualmente via interface após a migração.`
  },
  {
    name: "16. institutional_documents",
    description: "Documentos institucionais - 2 registros",
    order: 16,
    code: `INSERT INTO public.institutional_documents (id, title, description, type, file_name, file_size, file_url, uploaded_by, created_at, updated_at) VALUES
  ('20300fbd-46ff-43a9-91a3-e0c18114c4eb', 'Manual do Bolsista', 'Manual do Bolsista do Instituto ICCA', 'manual', 'Manual do Bolsista ICCA V2.pdf', 221233, 'https://bllwrehynktoboezwalw.supabase.co/storage/v1/object/public/institutional-documents/manual/1770402868087-jmuexs.pdf', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-06 18:34:29.884878+00', '2026-02-06 18:34:29.884878+00'),
  ('7d38d9b5-69d1-4bb1-84e1-fa2b071fb516', 'Template de Relatório Mensal', 'Modelo base para os bolsistas', 'template', 'Modelo de relatório mensal ICCA-Tommasi.docx', 81605, 'https://bllwrehynktoboezwalw.supabase.co/storage/v1/object/public/institutional-documents/template/1770678692417-923c25.docx', '3e893529-c8f5-4807-af00-4a9897aa444b', '2026-02-09 23:11:33.689626+00', '2026-02-09 23:11:33.689626+00')
ON CONFLICT (id) DO NOTHING;

-- ⚠️ NOTA: Os file_url apontam para o storage do ambiente atual.
-- Após migração, será necessário:
-- 1. Baixar os arquivos do storage atual
-- 2. Fazer upload no storage do novo ambiente
-- 3. Atualizar os file_url com as novas URLs`
  },
  {
    name: "17. messages (opcional)",
    description: "Mensagens - 5 registros (dados operacionais, migração opcional)",
    order: 17,
    code: `-- ⚠️ Mensagens são dados operacionais/transacionais.
-- A migração é OPCIONAL - recomenda-se iniciar limpo no novo ambiente.
-- Se desejar migrar, desabilite os triggers ANTES da inserção:
-- ALTER TABLE messages DISABLE TRIGGER USER;

INSERT INTO public.messages (id, recipient_id, sender_id, subject, body, type, organization_id, read, created_at, updated_at) VALUES
  ('d7eee211-e6d2-42c4-9630-3cbfe3248729', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '3e893529-c8f5-4807-af00-4a9897aa444b', 'Teste', 'Teste de envio', 'GESTOR', NULL, true, '2026-02-12 01:07:47.170193+00', '2026-02-12 01:52:56.747386+00'),
  ('1f45b640-92a4-4f45-983c-8cea18f4a297', '190f52bb-2a3d-4a63-abcb-853f638ffd81', '3e893529-c8f5-4807-af00-4a9897aa444b', 'Teste V2 - Mensagens', 'Olá Alessandro! Este é um e-mail de teste enviado pela tela de Mensagens V2 do BolsaGO.', 'GESTOR', 'a1111111-1111-1111-1111-111111111111', true, '2026-02-12 02:01:37.469269+00', '2026-02-12 02:36:01.018684+00')
ON CONFLICT (id) DO NOTHING;

-- ALTER TABLE messages ENABLE TRIGGER ALL;`
  },
  {
    name: "18. notifications (opcional)",
    description: "Notificações - dados transacionais, migração opcional",
    order: 18,
    code: `-- ⚠️ Notificações são dados transacionais.
-- Recomenda-se NÃO migrar e iniciar limpo no novo ambiente.
-- Se necessário, o sistema gerará novas notificações automaticamente.

-- Total de notificações no ambiente atual: ~20 registros
-- Todas são notificações de status (relatórios aprovados, pagamentos efetuados)
-- que serão regeneradas naturalmente pelo uso do sistema.`
  },
  {
    name: "19. audit_logs (opcional)",
    description: "Logs de auditoria - dados históricos, migração opcional",
    order: 19,
    code: `-- ⚠️ Audit logs são dados HISTÓRICOS.
-- Podem ser migrados para preservar rastreabilidade, mas não são
-- essenciais para o funcionamento do sistema.
-- 
-- Total de registros: ~50+ logs
-- Tipos de ações registradas: project_updated, assign_scholar_to_project,
-- enrollment_updated, bank_data_validated, etc.
--
-- Se desejar migrar, exporte via:
-- SELECT * FROM audit_logs ORDER BY created_at;
-- E gere os INSERTs preservando todos os campos JSON (details, previous_value, new_value).`
  }
];

export const DISABLE_TRIGGERS_SCRIPT = `-- =============================================
-- DESABILITAR TRIGGERS (executar ANTES dos INSERTs)
-- =============================================
-- IMPORTANTE: Use DISABLE TRIGGER USER (não ALL) para evitar erro de permissão
-- em triggers de sistema (foreign keys). O comando ALL requer superuser.
ALTER TABLE public.reports DISABLE TRIGGER USER;
ALTER TABLE public.payments DISABLE TRIGGER USER;
ALTER TABLE public.messages DISABLE TRIGGER USER;
ALTER TABLE public.notifications DISABLE TRIGGER USER;
-- ⚠️ NÃO desabilitar triggers do bank_accounts!
-- O trigger encrypt_and_mask_pix_key precisa estar ativo para criptografar PIX.
-- Apenas desabilite o trigger de prevenção de edição se necessário:
-- ALTER TABLE public.bank_accounts DISABLE TRIGGER trg_prevent_bank_fields_edit;

-- =============================================
-- REABILITAR TRIGGERS (executar APÓS os INSERTs)
-- =============================================
-- ALTER TABLE public.reports ENABLE TRIGGER USER;
-- ALTER TABLE public.payments ENABLE TRIGGER USER;
-- ALTER TABLE public.messages ENABLE TRIGGER USER;
-- ALTER TABLE public.notifications ENABLE TRIGGER USER;
-- ALTER TABLE public.bank_accounts ENABLE TRIGGER trg_prevent_bank_fields_edit;`;

export const VERIFICATION_SCRIPT = `-- =============================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- =============================================

-- Contagem de registros por tabela
SELECT 'organizations' AS tabela, COUNT(*) AS total FROM public.organizations
UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL SELECT 'profiles_sensitive', COUNT(*) FROM public.profiles_sensitive
UNION ALL SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL SELECT 'organization_members', COUNT(*) FROM public.organization_members
UNION ALL SELECT 'thematic_projects', COUNT(*) FROM public.thematic_projects
UNION ALL SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL SELECT 'invite_codes', COUNT(*) FROM public.invite_codes
UNION ALL SELECT 'invite_code_uses', COUNT(*) FROM public.invite_code_uses
UNION ALL SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL SELECT 'reports', COUNT(*) FROM public.reports
UNION ALL SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL SELECT 'bank_accounts', COUNT(*) FROM public.bank_accounts
UNION ALL SELECT 'grant_terms', COUNT(*) FROM public.grant_terms
UNION ALL SELECT 'message_templates', COUNT(*) FROM public.message_templates
UNION ALL SELECT 'institutional_documents', COUNT(*) FROM public.institutional_documents
UNION ALL SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL SELECT 'audit_logs', COUNT(*) FROM public.audit_logs
ORDER BY tabela;

-- Verificar integridade referencial
SELECT 'profiles sem auth.users' AS check_name, COUNT(*) AS orphans
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'enrollments sem project', COUNT(*)
FROM public.enrollments e
LEFT JOIN public.projects p ON e.project_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'payments sem enrollment', COUNT(*)
FROM public.payments p
LEFT JOIN public.enrollments e ON p.enrollment_id = e.id
WHERE e.id IS NULL;`;
