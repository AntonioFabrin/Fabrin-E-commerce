# Relatório de conclusão — Bloco 2 (Identity)

Data da validação: 19/08/2026 (America/Sao_Paulo)

Status: **concluído**.

## Escopo validado

### Fase 1 — B2.01–B2.06: contrato de identidade

- Papéis públicos definidos como `customer` e `seller`; `admin` somente por operação administrativa.
- Contratos HTTP, códigos de resposta e matriz de autorização documentados.
- JWT Bearer, validade de 8 horas, política de senha e compatibilidade incremental definidos.
- Resultado: contrato conferido com as chamadas existentes no frontend.

### Fase 2 — B2.07–B2.15: núcleo hexagonal

- Domínio, portas de entrada, portas de saída e serviço de aplicação implementados.
- Normalização de nome/e-mail, unicidade, login genérico, atualização, exclusão, listagem e troca de papel implementados.
- O núcleo não importa Spring, JPA ou Jakarta Validation.
- Resultado: 7 testes unitários aprovados e verificação estática da fronteira hexagonal aprovada.

### Fase 3 — B2.16–B2.21: PostgreSQL e Flyway

- Migração `V2__create_identity_schema.sql` adicionada com tabela compatível e índice único para e-mail normalizado.
- Adaptador JPA implementado sem vazar entidades de infraestrutura para o domínio.
- Compatibilidade com usuários e hashes BCrypt legados validada em PostgreSQL 16 real.
- Resultado: 3 testes do adaptador e 1 teste de migração aprovados.

### Fase 4 — B2.22–B2.29: segurança

- BCrypt e JWT HS256 implementados por adaptadores de saída.
- API configurada como stateless, sem sessão, form login ou HTTP Basic.
- Filtro Bearer, CORS e respostas JSON estáveis para `401` e `403` implementados.
- Segredo JWT mínimo de 32 bytes exigido e validado; o segredo local fraco foi rotacionado sem ser exposto.
- Resultado: 4 testes dos adaptadores de segurança e teste de inicialização aprovados.

### Fase 5 — B2.30–B2.38: API REST

- Implementados cadastro, login, perfil atual, atualização, exclusão, listagem administrativa e troca de papel.
- DTOs com Bean Validation e tratamento global de erros estáveis implementados.
- Campos desconhecidos são rejeitados para bloquear tentativa de escalada por payload.
- Resultado: 5 testes de contrato web aprovados.

### Fase 6 — B2.39–B2.47: integração e autorização

- Testes de ponta a ponta usam servidor HTTP real e PostgreSQL 16 via Testcontainers.
- Cobertos: autenticação ausente/inválida, cadastro, duplicidade case-insensitive, login, autorização por papel, escalada, papel obsoleto no JWT e exclusão.
- Resultado geral Java: **22 testes, 0 falhas, 0 erros e 0 ignorados**.

### Fase 7 — B2.48–B2.53: cutover incremental

- O proxy Next.js encaminha identidade ao Java e mantém catálogo, pedidos, pagamentos e uploads no Node.
- Frontend atualizado para `/api/me`, política de senha e descarte local de JWT expirado.
- Compose passou a executar PostgreSQL, Node, Java e frontend com o mesmo segredo JWT.
- O ambiente Docker do Node foi corrigido para sempre usar o PostgreSQL local, sem herdar uma `DATABASE_URL` remota do `.env`.
- Plano de ativação e rollback documentado.
- Resultado do smoke após rebuild das imagens:
  - `GET /api/ping` pelo proxy: `200`;
  - `POST /api/register` no Java: `201`;
  - `POST /api/login` no Java: `200`;
  - `GET /api/me` no Java: `200`;
  - `GET /api/orders/my` no Node usando JWT emitido pelo Java: `200`;
  - `DELETE /api/me` no Java: `200`.

## Revalidação final

- `mvnw.cmd clean test`: aprovado, 22/22.
- Build TypeScript do backend Node: aprovado.
- Build de produção do frontend Next.js 16.3.1: aprovado, 15 rotas geradas.
- Build das imagens Docker do backend e frontend: aprovado.
- `docker compose config --quiet`: aprovado.
- Fronteira hexagonal: aprovada.
- Segredo JWT local: 64 caracteres; valor não registrado neste relatório.
- Usuários temporários de smoke restantes: 0.
- Containers e rede de validação removidos; volumes `postgres_data` e `uploads_data` preservados.

## Correções feitas durante a validação

1. Corrigida uma construção de `switch` incompatível com Java 21.
2. Corrigida a configuração do teste web para fornecer as dependências de segurança e o principal autenticado.
3. Rotacionado o segredo JWT local que não atendia ao mínimo de segurança.
4. Corrigida a precedência das variáveis de banco do Node dentro do Compose.
5. Atualizadas dependências compatíveis do Node e do frontend: vulnerabilidades altas passaram de 1 para 0 no backend e de 6 para 0 no frontend.

## Pendência fora do escopo de Identity

O backend Node ainda apresenta 2 vulnerabilidades **moderadas** transitivas no `uuid` usado pelo SDK Mercado Pago 2.x. A correção automática exige Mercado Pago 3.4.0, uma atualização major com quebra de API. Ela deve ser tratada no bloco de pagamentos, com testes específicos do checkout e webhook; não foi forçada nesta entrega para não introduzir regressão silenciosa.
