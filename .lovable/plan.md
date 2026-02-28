

## Diagnóstico

Os dois auditores (`o.heringer@tommasi.com.br` e `suporte@innovago.app`) **não existem** na tabela `auth.users` do ambiente atual. A tabela tem apenas 7 usuários e nenhum desses emails consta. A screenshot mostra a UI de membros de um ambiente anterior — os dados não migraram para o banco atual.

Como não é possível inserir diretamente em `auth.users` (schema reservado), precisamos recriá-los via Edge Function.

## Plano

### 1. Criar os 2 usuários auditores via Edge Function `manage-users`

Chamar a Edge Function `create-users-batch` com uma lógica adaptada para:
- Criar `o.heringer@tommasi.com.br` (Otávio Arruda Heringer) e `suporte@innovago.app` (Suporte Innovago) com email_confirm: true
- Precisam de CPF para o `handle_new_user` trigger — se não houver CPF real, o trigger vai falhar. Alternativa: criar diretamente via `supabaseAdmin.auth.admin.createUser` sem passar pelo trigger, e inserir profile/role manualmente.

### 2. Atribuir role `auditor` em `user_roles`

Após criar os auth users, inserir na tabela `user_roles`:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<user_id>', 'auditor');
```

### 3. Inserir em `organization_members` com role `auditor`

```sql
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('a1111111-1111-1111-1111-111111111111', '<user_id>', 'auditor');
```

### 4. Atualizar Edge Function para suportar criação de auditores

Modificar `create-users-batch` para aceitar um parâmetro `role` opcional. Quando `role = 'auditor'`, pular a validação de invite code e CPF, e atribuir o role correto.

### 5. Criar profiles para os auditores

Inserir perfis básicos com `full_name`, `email`, `organization_id` apontando para Tommasi.

### Informação necessária

Preciso de dois dados para prosseguir:
- **CPFs** dos auditores (ou permissão para criar sem CPF, adaptando o trigger)
- **Senha inicial** desejada (ex: `InnovaGO@2026`) ou se devem receber email de redefinição

Sem essas informações, posso criar uma versão da Edge Function que bypass o trigger e cria tudo manualmente (profile + role + org_member) sem exigir CPF.

