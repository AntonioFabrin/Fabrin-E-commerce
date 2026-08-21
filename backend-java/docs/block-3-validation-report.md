# Relatório de conclusão — Bloco 3 (Catalog)

Data da validação: 20/08/2026 (America/Sao_Paulo)

Status: **concluído**.

## Checklist sequencial

Cada fase foi implementada, testada e corrigida antes do início da fase seguinte.

| Fase | IDs | Resultado |
|---|---|---|
| Contrato e fronteiras | B3.01–B3.07 | Concluído |
| Núcleo hexagonal | B3.08–B3.17 | Concluído |
| PostgreSQL e Flyway | B3.18–B3.25 | Concluído |
| Imagens | B3.26–B3.33 | Concluído |
| REST e segurança | B3.34–B3.42 | Concluído |
| Integração e regressão | B3.43–B3.50 | Concluído |
| Cutover incremental | B3.51–B3.57 | Concluído |
| Storage Supabase e categorias | B3.58–B3.64 | Concluído |

## Fase 1 — B3.01–B3.07: contrato e fronteiras

- Rotas Node, chamadas do frontend e formatos legados foram inventariados.
- Ficou definido que apenas produtos e `/uploads/products/**` migram neste bloco.
- Envelopes JSON, nomes `snake_case`, multipart, validações, autorização, storage e rollback foram congelados.
- Pedidos, pagamentos, avaliações e módulos de seller permanecem no Node.
- Resultado: contrato conferido contra os consumidores existentes do frontend.

## Fase 2 — B3.08–B3.17: núcleo hexagonal

- Agregado `Product`, valores de nome, descrição, preço e estoque implementados.
- Criadas portas de entrada para listagem, detalhe, seller, criação, atualização e exclusão.
- Criadas portas de saída para produto, papel atual do ator e imagens.
- `CatalogService` implementa autorização, compensação de imagem em falha do banco e limpeza após troca/exclusão.
- Admin que troca imagem de produto alheio mantém o arquivo na pasta do seller proprietário.
- Resultado: 10 testes unitários de domínio e aplicação aprovados.

## Fase 3 — B3.18–B3.25: PostgreSQL e Flyway

- Migration `V3__create_catalog_schema.sql` adicionada sem operação destrutiva.
- Compatibilidade validada em banco vazio e sobre uma tabela `products` legada.
- Entidade JPA e adapter não vazam tipos de infraestrutura para o domínio.
- Paginação, busca por seller/ID, criação, atualização, exclusão e leitura do papel atual foram implementadas.
- Resultado: 4 testes do adapter e teste de migrations aprovados em PostgreSQL 16 real.

## Fase 4 — B3.26–B3.33: imagens

- Diretório configurável por `PRODUCT_UPLOAD_DIR` e prefixo `/uploads/products`.
- Limite de 5 MiB e assinaturas JPEG, PNG e WebP validados pelos bytes.
- Nome original e MIME informado não são usados como prova do formato.
- Arquivos recebem UUID, ficam isolados por seller e são gravados com movimento atômico quando suportado.
- Traversal é bloqueado e a exclusão ignora URLs HTTP(S) legadas ou caminhos fora do storage gerenciado.
- Recursos removidos retornam `404`, não `401`.
- Resultado: 4 testes específicos de storage e cobertura HTTP ponta a ponta aprovados.

## Fase 5 — B3.34–B3.42: REST e segurança

- Preservados `GET /api/products`, `GET /api/products/{id}` e `GET /api/products/seller`.
- Preservados CRUD multipart e mensagens legadas de criação, atualização e exclusão.
- DTOs retornam `seller_id`, `category_id`, `image_url`, `created_at` e paginação no formato anterior.
- GETs públicos; escrita restrita a seller/admin; propriedade e papel atual também são validados na aplicação.
- Erros estáveis usam `{ erro, codigo }` com `400`, `401`, `403` e `404` coerentes.
- Resultado: 5 testes de contrato do catálogo e 5 testes de regressão da identidade aprovados.

## Fase 6 — B3.43–B3.50: integração e regressão

- Teste com servidor HTTP real e PostgreSQL 16 via Testcontainers cobre criação, leitura, paginação e imagem pública.
- Cobertos customer bloqueado, isolamento entre sellers, dono, admin e seller com JWT obsoleto após despromoção.
- Cobertas substituição/limpeza de imagem, exclusão e respostas `404` depois da remoção.
- Migration V3 executada junto das migrations anteriores e Hibernate validou o schema.
- Resultado daquela etapa: **47 testes, 0 falhas, 0 erros e 0 ignorados**.

## Fase 7 — B3.51–B3.57: cutover incremental

- Next encaminha `/api/products`, `/api/products/**` e `/uploads/products/**` ao destino de catálogo Java.
- Demais rotas continuam no Node; identity continua no Java.
- `CATALOG_BACKEND_INTERNAL_URL` permite ativação e rollback sem alterar o frontend.
- Compose raiz e Compose Java isolado incluem volume persistente de imagens.
- Dockerfile Java prepara o diretório com permissão do usuário não privilegiado.
- Procedimento de ativação e rollback documentado em `catalog-cutover.md`.
- Script reproduzível criado em `scripts/smoke-catalog.ps1`.

## Fase 8 — B3.58–B3.64: storage Supabase e categorias

- A porta de imagens permanece independente de infraestrutura e o provider é
  selecionado por `PRODUCT_STORAGE_PROVIDER=local|supabase`.
- A validação de até 5 MiB e das assinaturas JPEG, PNG e WebP foi extraída e é
  compartilhada pelos dois adapters.
- `SupabaseImageStorageAdapter` envia bytes para caminhos únicos isolados pelo
  seller, monta a URL pública e remove somente objetos reconhecidos do bucket.
- A service role key é usada apenas em headers server-side; erros remotos não
  incluem credenciais e são expostos como `502` com código estável.
- Criadas `ProductCategoryRepositoryPort`, implementação JDBC e migration V4.
- Categorias inexistentes ou inativas são rejeitadas antes de gravar imagem ou
  produto; o PostgreSQL também protege novas gravações com chave estrangeira.
- IDs positivos encontrados em produtos legados são preservados e a categoria
  padrão `1` (`Geral`) é garantida.
- Resultado: testes HTTP simulados do Supabase, seleção de bean, domínio,
  persistência legada e ponta a ponta em PostgreSQL 16 aprovados.

## Evidências finais

- `mvnw.cmd clean test`: aprovado, **55/55**.
- Build TypeScript do Node: aprovado.
- Build de produção do Next.js 16.3.1: aprovado, 15 rotas geradas.
- Build final da imagem Docker Java: aprovado.
- Build conjunto das imagens Node, Java e frontend: aprovado.
- `docker compose config --quiet`: aprovado no Compose raiz e no Compose Java.
- Flyway chegou à versão **4**, incluindo catálogo e categorias.
- Fronteira hexagonal: nenhum import Spring/JPA/Jakarta no domínio ou aplicação do catálogo.
- `git diff --check`: aprovado; somente avisos de conversão LF/CRLF do Git no Windows.
- Smoke direto no Java: `SMOKE_OK`.
- Smoke integral pelo frontend/Next: `SMOKE_OK`.
- No smoke, o Node leu o produto criado pelo Java e aceitou o JWT emitido pelo Java.
- Usuários e produtos temporários restantes: **0**.
- Containers e rede desta validação removidos; volumes persistentes preservados.
- O container não relacionado que ocupava a porta 3000 não foi alterado; o frontend de teste usou a porta 3001.

## Correções feitas durante a validação

1. Corrigida a configuração das propriedades de storage nos testes MVC.
2. Corrigido o binding multipart para o formato usado pelo frontend.
3. Corrigido `/error` protegido, que transformava `404` de imagem removida em `401`.
4. Corrigido o caminho de imagem substituída por admin para continuar pertencendo ao seller do produto.
5. Atualizado o teste de `/actuator/info` para o estágio de migração `catalog`.
6. O smoke deixou de depender de imagens placeholder vazias e passou a gerar bytes de teste válidos em memória.
7. Implementado o adapter Supabase que faltava no requisito original.
8. Validação de categoria passou de “inteiro positivo” para existência e atividade reais.
9. O smoke direto foi ajustado para obter identidade pelo proxy Java; chamar o
   login legado do Node gera, por definição, um token sem o issuer exigido pelo Java.

## Limite operacional conhecido

O adapter Supabase foi validado contra um servidor HTTP simulado para não gravar
objetos no projeto real durante a regressão. A ativação exige criar/deixar público
o bucket configurado e fornecer as credenciais reais apenas no ambiente do Java.
O adapter local continua disponível para desenvolvimento e rollback.
