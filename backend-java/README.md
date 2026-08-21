# FabrinMarket Java API

Backend Java criado para uma migracao incremental do backend Node.js. O modulo
`identity` e `catalog` ja substituem cadastro, login, usuarios e produtos,
preservando os contratos usados pelo frontend.

## Pre-requisitos

- JDK 21
- Docker Desktop, ou JDK 21 para execução sem Docker
- PostgreSQL 16 para execucao local sem Docker

O Maven 3.9.11 e baixado automaticamente pelos scripts `mvnw`/`mvnw.cmd`.

## Executar localmente

Copie `.env.example` para `.env` se quiser guardar as configuracoes localmente. Defina uma URL JDBC ou as variaveis `DB_*` antes de iniciar:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/ecommerce'
$env:SPRING_DATASOURCE_USERNAME = 'postgres'
$env:SPRING_DATASOURCE_PASSWORD = 'sua-senha'
$env:JWT_SECRET = 'uma-chave-com-pelo-menos-32-bytes'
.\mvnw.cmd spring-boot:run
```

Os endpoints operacionais ficam em `http://localhost:8080/actuator/health` e
`http://localhost:8080/actuator/info`.

Por padrão, as imagens novas do catálogo ficam em `PRODUCT_UPLOAD_DIR`
(`./uploads/products`) e são expostas em `/uploads/products/**`. Para usar o
Supabase Storage, defina `PRODUCT_STORAGE_PROVIDER=supabase`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_PRODUCTS_BUCKET`. A service role key é
exclusivamente server-side.

Para um PostgreSQL hospedado com SSL, defina a URL JDBC com `?sslmode=require`.

## Executar em Docker

```powershell
docker compose up --build
```

O Compose cria um PostgreSQL isolado na porta `5433` e inicia a API na porta
`8080`. O schema legado e importado na primeira inicializacao e as mudancas do
backend Java sao versionadas em `src/main/resources/db/migration` pelo Flyway.

A revalidacao completa da fundacao esta registrada em
`docs/block-1-validation-report.md`.

## Modulo identity

O modulo usa arquitetura hexagonal: dominio e casos de uso nao dependem de
Spring; web, PostgreSQL, BCrypt e JWT sao adaptadores. As rotas principais sao:

- `POST /api/register`
- `POST /api/login`
- `GET`, `PUT` e `DELETE /api/me`
- `GET /api/users` para admin
- `PATCH /api/users/{id}/role` para admin
- `PUT` e `DELETE /api/{id}` como compatibilidade temporaria

O contrato detalhado esta em `docs/identity-contract.md`, o procedimento de
cutover/rollback em `docs/identity-cutover.md` e a evidencia final em
`docs/block-2-validation-report.md`.

## Modulo catalog

O catálogo segue a mesma separação hexagonal e implementa listagem pública,
detalhe, produtos do seller, criação/edição multipart e exclusão. As regras de
dono/admin são revalidadas contra o banco, e o storage aceita apenas assinaturas
JPEG, PNG ou WebP com até 5 MiB.

O contrato está em `docs/catalog-contract.md` e o procedimento de ativação e
rollback em `docs/catalog-cutover.md`. A evidência B3.01–B3.64 está em
`docs/block-3-validation-report.md`.

Os testes cobrem dominio, contratos HTTP, BCrypt compativel com Node, JWT,
persistencia legada, Flyway, matriz de autorizacao e fluxo end-to-end em
PostgreSQL real via Testcontainers.
