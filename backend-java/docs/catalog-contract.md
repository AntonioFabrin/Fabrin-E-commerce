# Bloco 3 — Contrato do módulo Catalog

O Bloco 3 migra catálogo e produtos do Node.js para o backend Java sem alterar
as chamadas usadas pelo frontend. Pedidos, pagamentos, avaliações e analytics
permanecem no Node nesta etapa.

## Fases e IDs

### Fase 1 — contrato e fronteiras

- B3.01: inventariar rotas e consumidores legados.
- B3.02: congelar formatos de requisição e resposta.
- B3.03: definir invariantes de produto.
- B3.04: definir matriz de autorização.
- B3.05: definir contrato de upload e armazenamento.
- B3.06: definir estratégia incremental e rollback.
- B3.07: validar o contrato contra o frontend existente.

### Fase 2 — núcleo hexagonal

- B3.08: criar o agregado `Product`.
- B3.09: criar valores e regras de preço, estoque e texto.
- B3.10: criar visão de saída do catálogo.
- B3.11: criar portas de entrada de listagem e detalhe.
- B3.12: criar porta de entrada de criação.
- B3.13: criar portas de entrada de atualização e exclusão.
- B3.14: criar porta de listagem do vendedor autenticado.
- B3.15: criar porta de repositório.
- B3.16: criar portas de acesso do ator e armazenamento.
- B3.17: implementar e testar os casos de uso.

### Fase 3 — PostgreSQL e Flyway

- B3.18: criar a migração V3 compatível com o schema legado.
- B3.19: mapear a entidade JPA sem vazamento para o domínio.
- B3.20: implementar paginação ordenada.
- B3.21: implementar busca por produto e vendedor.
- B3.22: implementar criação e atualização.
- B3.23: implementar exclusão.
- B3.24: implementar consulta do papel atual no banco.
- B3.25: validar persistência e Flyway em PostgreSQL 16 real.

### Fase 4 — imagens

- B3.26: configurar diretório e prefixo público.
- B3.27: validar limite de 5 MB.
- B3.28: validar assinatura real de JPEG, PNG e WebP.
- B3.29: gerar nomes seguros e não previsíveis.
- B3.30: impedir travessia de diretório.
- B3.31: implementar gravação atômica local.
- B3.32: implementar remoção segura somente de arquivos gerenciados.
- B3.33: expor imagens por `/uploads/products/**` e testar o adaptador.

### Fase 5 — REST e segurança

- B3.34: criar DTOs multipart e respostas compatíveis.
- B3.35: implementar listagem pública paginada.
- B3.36: implementar detalhe público.
- B3.37: implementar produtos do vendedor autenticado.
- B3.38: implementar criação multipart.
- B3.39: implementar atualização multipart com imagem opcional.
- B3.40: implementar exclusão.
- B3.41: integrar regras no Spring Security.
- B3.42: implementar erros estáveis e testes de contrato web.

### Fase 6 — integração e regressão

- B3.43: testar criação e leitura ponta a ponta.
- B3.44: testar paginação e ordenação.
- B3.45: testar validações de produto e imagem.
- B3.46: testar autorização de customer, seller e admin.
- B3.47: testar isolamento entre vendedores.
- B3.48: testar papel obsoleto no JWT.
- B3.49: testar troca e limpeza de imagem.
- B3.50: executar toda a suíte Java sem regressões.

### Fase 7 — cutover incremental

- B3.51: separar o destino de catálogo no proxy Next.js.
- B3.52: encaminhar `/api/products/**` ao Java.
- B3.53: encaminhar `/uploads/products/**` ao Java.
- B3.54: persistir imagens em volume Docker.
- B3.55: documentar ativação e rollback.
- B3.56: validar builds de Java, Node e frontend.
- B3.57: executar smoke real através do frontend e limpar os dados temporários.

### Fase 8 — storage Supabase e categorias

- B3.58: tornar o provider de imagens configurável sem alterar a porta do caso de uso.
- B3.59: compartilhar validação binária entre os adapters local e Supabase.
- B3.60: implementar upload no `SupabaseImageStorageAdapter` com chave server-side.
- B3.61: implementar remoção segura pela Storage API apenas para objetos gerenciados.
- B3.62: criar porta e adapter de consulta de categorias ativas.
- B3.63: criar migration V4 com categoria padrão, legado e chave estrangeira.
- B3.64: validar seleção do provider, categoria e regressão completa.

## Endpoints preservados

| Método | Rota | Proteção | Resposta principal |
|---|---|---|---|
| GET | `/api/products?page=1&limit=50` | Pública | `{ dados, paginacao }` |
| GET | `/api/products/{id}` | Pública | Produto |
| GET | `/api/products/seller` | Seller/admin | Lista de produtos do ator |
| POST | `/api/products` | Seller/admin | `{ mensagem, produtoId }` |
| PUT | `/api/products/{id}` | Dono/admin | `{ mensagem }` |
| DELETE | `/api/products/{id}` | Dono/admin | `{ mensagem }` |
| GET | `/uploads/products/**` | Pública | Conteúdo da imagem |

Os nomes JSON legados são preservados: `seller_id`, `category_id`, `image_url`,
`created_at`, `pagina_atual`, `itens_por_pagina`, `total_de_itens` e
`total_de_paginas`.

## Multipart

Criação recebe:

- `name`: obrigatório, 3–255 caracteres após normalização;
- `description`: opcional, até 5.000 caracteres;
- `price`: obrigatório, positivo, até 2 casas decimais e compatível com `NUMERIC(10,2)`;
- `stock`: obrigatório, inteiro entre 0 e 1.000.000;
- `category_id`: opcional, inteiro positivo, padrão 1, e deve referenciar uma categoria ativa;
- `image`: obrigatória na criação.

Atualização recebe os mesmos campos; a imagem é opcional e, quando omitida,
mantém a imagem atual.

## Imagens

- Tamanho máximo: 5 MiB.
- Formatos: JPEG, PNG e WebP.
- A assinatura binária é verificada; `Content-Type` e extensão enviados pelo
  cliente não são considerados prova suficiente.
- No provider `local`, arquivos novos ficam sob `/uploads/products/{sellerId}/...`.
- No provider `supabase`, objetos ficam em `{sellerId}/{uuid}.{ext}` no bucket
  configurado e a API persiste a URL pública retornável.
- URLs HTTP(S) legadas, inclusive Supabase, continuam armazenadas e retornadas
  sem transformação.
- Troca de imagem remove a anterior somente depois da atualização do banco.
- Falha de persistência remove a nova imagem para não deixar órfãos.
- Falha do Supabase retorna `502` com código estável, sem expor credenciais.

## Autorização

| Ação | Customer | Seller | Admin |
|---|---:|---:|---:|
| Listar/detalhar | Sim | Sim | Sim |
| Criar | Não | Sim | Sim |
| Listar próprios | Não | Sim | Sim |
| Editar/excluir próprio | Não | Sim | Sim |
| Editar/excluir de outro vendedor | Não | Não | Sim |

Para operações protegidas, o papel atual é consultado no PostgreSQL. Um JWT de
seller/admin emitido antes de uma despromoção não mantém privilégios de catálogo.

## Paginação e erros

- `page`: mínimo 1, padrão 1.
- `limit`: 1–100, padrão 50.
- IDs, página ou limite inválidos retornam `400`.
- Produto inexistente retorna `404`.
- Falta de autenticação retorna `401`.
- Papel ou propriedade insuficiente retorna `403`.
- Erros usam `{ "erro": "...", "codigo": "..." }`; o campo `erro` mantém
  compatibilidade com o frontend.

## Cutover e rollback

O frontend usa `CATALOG_BACKEND_INTERNAL_URL` para as rotas de produtos e
imagens do catálogo. Na ativação, ela aponta para o Java. Para rollback, basta
apontá-la novamente ao backend Node e reconstruir/reiniciar o frontend; nenhuma
migração destrutiva faz parte deste bloco.
