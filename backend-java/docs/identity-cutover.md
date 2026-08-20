# Cutover incremental do módulo Identity

## Topologia

- Java (`identity`): `/api/register`, `/api/login`, `/api/me`, `/api/users` e
  `/api/users/**`.
- Node.js (legado): demais rotas `/api/**` e `/uploads/**`.
- Ambos usam a mesma tabela `users` e obrigatoriamente o mesmo `JWT_SECRET`.

O frontend faz a divisão pelas variáveis:

```env
BACKEND_INTERNAL_URL=http://127.0.0.1:3333
IDENTITY_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
```

O `docker-compose.yml` da raiz já cria os dois backends, compartilha o banco e
injeta o mesmo `JWT_SECRET` do `.env`.

## Checklist de ativação

1. Confirmar `JWT_SECRET` com no mínimo 32 bytes no ambiente.
2. Subir PostgreSQL, Node, Java e frontend.
3. Confirmar `/actuator/health` do Java.
4. Cadastrar pela rota do frontend `/api/register`.
5. Fazer login e chamar `/api/me` com o Bearer token.
6. Usar o mesmo token em uma rota protegida do Node, como `/api/orders/my`.
7. Confirmar que senha/hash não aparecem em nenhuma resposta.

## Rollback

Para voltar temporariamente o identity ao Node sem alterar banco ou frontend,
defina `IDENTITY_BACKEND_INTERNAL_URL` com a mesma URL de
`BACKEND_INTERNAL_URL` e reconstrua/reinicie o frontend. A migration V2 é
compatível com o schema legado e não precisa ser revertida.

O rollback não deve trocar o `JWT_SECRET`: tokens emitidos antes da mudança
continuam válidos nos dois backends até expirarem.
