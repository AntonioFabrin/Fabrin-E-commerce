# Bloco 2 — Contrato do módulo Identity

Este documento fecha as decisões B2.01–B2.06 antes da implementação. O módulo
Java deve manter compatibilidade com as rotas usadas pelo frontend, corrigindo as
falhas de autorização encontradas no backend Node.js.

## Roles oficiais

- `customer`: pode manter a própria conta e acessar recursos de comprador.
- `seller`: possui as permissões de `customer` e recursos de vendedor.
- `admin`: administra usuários e roles.

O cadastro público aceita somente `customer` ou `seller`. A role `admin` só pode
ser concedida por um administrador autenticado. O termo `buyer` não faz parte do
contrato da API.

## Endpoints

| Método | Rota | Acesso | Resultado principal |
|---|---|---|---|
| `POST` | `/api/register` | Público | Cadastra `customer` ou `seller` |
| `POST` | `/api/login` | Público | Retorna JWT e dados públicos do usuário |
| `GET` | `/api/me` | Autenticado | Retorna o usuário autenticado |
| `PUT` | `/api/me` | Autenticado | Atualiza nome/e-mail próprios |
| `DELETE` | `/api/me` | Autenticado | Exclui a própria conta |
| `PUT` | `/api/{id}` | Próprio usuário ou admin | Compatibilidade com o frontend legado |
| `DELETE` | `/api/{id}` | Próprio usuário ou admin | Compatibilidade com o frontend legado |
| `GET` | `/api/users` | Admin | Lista dados públicos dos usuários |
| `PATCH` | `/api/users/{id}/role` | Admin | Altera a role do usuário |

Atualização de perfil nunca aceita `password` ou `role`. Alteração de role usa um
endpoint exclusivo de administração.

## Contratos HTTP

Cadastro:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-segura",
  "role": "customer"
}
```

Resposta `201 Created`:

```json
{"mensagem":"Id criado com sucesso","id":1}
```

Login:

```json
{"email":"maria@example.com","password":"senha-segura"}
```

Resposta `200 OK`:

```json
{
  "mensagem": "Login conectado com sucesso!",
  "token": "jwt",
  "user": {"id":1,"name":"Maria Silva","email":"maria@example.com","role":"customer"}
}
```

Erros usam o formato `{"erro":"mensagem","codigo":"CODIGO_ESTAVEL"}`. Login
inválido sempre retorna a mensagem genérica `Credenciais inválidas`, sem revelar
se o e-mail existe.

## JWT

- Transporte: `Authorization: Bearer <token>`.
- Algoritmo: HMAC SHA-256.
- Expiração padrão: 8 horas.
- Issuer padrão: `fabrinmarket-api`.
- Claims: `sub` (id textual), `id` (número), `email`, `role`, `iat` e `exp`.
- `JWT_SECRET` é obrigatório e precisa ter ao menos 32 bytes UTF-8.
- A aplicação deve falhar no startup se a configuração for inválida.

O Bearer token foi mantido nesta migração para preservar o contrato do frontend.
O armazenamento atual no `localStorage` exige prevenção de XSS no frontend; uma
migração futura para cookie HttpOnly precisa incluir proteção CSRF e estratégia
cross-domain antes de ser adotada.

## Senhas

- Mínimo de 8 e máximo de 72 caracteres (limite útil do bcrypt).
- Hash BCrypt com custo 10, compatível com os hashes `$2b$10$` existentes.
- Senha e hash nunca aparecem em respostas ou logs.

## Matriz de autorização

| Operação | Anônimo | Customer | Seller | Admin |
|---|---:|---:|---:|---:|
| Cadastrar/login | Sim | Sim | Sim | Sim |
| Consultar próprio perfil | Não | Sim | Sim | Sim |
| Atualizar próprio perfil | Não | Sim | Sim | Sim |
| Atualizar outro usuário | Não | Não | Não | Sim |
| Excluir própria conta | Não | Sim | Sim | Sim |
| Excluir outro usuário | Não | Não | Não | Sim |
| Listar usuários | Não | Não | Não | Sim |
| Alterar role | Não | Não | Não | Sim |

## Critérios de aceite da fase

- Roles, rotas e payloads não possuem ambiguidades.
- O contrato continua atendendo login, cadastro e edição de perfil do frontend.
- Elevação de privilégio por atualização de perfil é impossível pelo contrato.
- Casos `401`, `403`, `404` e `409` estão definidos.
