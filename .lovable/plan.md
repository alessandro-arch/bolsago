

## Diagnóstico

Investiguei o banco de dados e encontrei o problema raiz:

1. **Nenhum usuário auditor existe** no banco. O email `suporte@innovago.app` não existe em `auth.users`. Apenas 8 usuários existem no sistema.
2. **Não existe role "auditor"** no sistema. O enum `app_role` tem apenas `admin`, `manager`, `scholar`. A tabela `organization_members` usa `owner`, `admin`, `manager`, `member`.
3. **O `AuditorLogin.tsx` atual** verifica `isAdmin` (role `admin` em `user_roles`) para redirecionar ao Dashboard ICCA. Qualquer outro papel recebe mensagem de erro.

O login falha porque o usuário simplesmente não existe no banco.

---

## Plano de Implementação

### 1. Criar role "auditor" no sistema

- Adicionar `'auditor'` ao enum `app_role` via migration SQL
- Atualizar `useUserRole.ts` para reconhecer o role `auditor` (prioridade: admin > manager > auditor > scholar)
- Adicionar propriedade `isAuditor` ao hook

### 2. Criar os usuários auditores no banco

- Usar a Edge Function `create-users-batch` ou `manage-users` existente para criar os usuários, OU criar via migration/insert
- Preciso saber **quais emails** devem ter acesso de auditor
- Atribuir role `auditor` em `user_roles` e membership em `organization_members`

### 3. Corrigir `AuditorLogin.tsx`

- Remover validação que bloqueia por role — usar o mesmo `signIn` genérico
- Após login, detectar role via `useUserRole`:
  - `admin` ou `auditor` → redirecionar para `/admin/dashboard-icca`
  - `manager` → mostrar aviso "use o portal do admin"
  - `scholar` → mostrar aviso "acesso restrito"

### 4. Ajustar `AdminProtectedRoute` para permitir auditores no Dashboard ICCA

- Na rota `/admin/dashboard-icca`, alterar `allowedRoles` para incluir `"auditor"`
- Ou criar flag `hasAuditorAccess` que combina admin + auditor

### 5. Ajustar RLS para que auditores possam ler dados

- Adicionar políticas SELECT em tabelas chave (profiles, projects, thematic_projects, payments, enrollments, reports) que permitam `has_role(auth.uid(), 'auditor')` com acesso somente-leitura
- Auditor NÃO deve ver dados bancários (bank_accounts, PIX keys)

### 6. Dashboard ICCA em modo read-only para auditores

- No `AdminIccaDashboard.tsx`, detectar se o usuário é auditor e esconder ações de escrita (botões de editar, excluir, criar)
- Manter todas as abas de visualização disponíveis

---

## Informação necessária antes de implementar

Preciso saber quais emails serão os auditores e com qual senha inicial devem ser criados. Sem isso, posso implementar toda a infraestrutura (role, RLS, roteamento) mas os usuários não conseguirão logar.

