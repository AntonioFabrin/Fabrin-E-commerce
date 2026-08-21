# Cutover incremental do módulo Catalog

## Topologia ativa

- Java (`identity`): `/api/register`, `/api/login`, `/api/me`, `/api/users` e `/api/users/**`.
- Java (`catalog`): `/api/products`, `/api/products/**` e `/uploads/products/**`.
- Node.js legado: pedidos, pagamentos, avaliações, vendedores e demais rotas `/api/**`.
- Os dois backends compartilham o PostgreSQL e o mesmo `JWT_SECRET`.

O Next separa os módulos com estas variáveis:

```env
BACKEND_INTERNAL_URL=http://127.0.0.1:3333
IDENTITY_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
CATALOG_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
```

O provider padrão é `local`; em Docker, suas imagens ficam no volume persistente
`product_uploads_data`. Para produção com object storage, use:

```env
PRODUCT_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://seu-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=chave-apenas-server-side
SUPABASE_PRODUCTS_BUCKET=product-images
```

O bucket precisa existir e ser público para que as URLs retornadas sejam
acessíveis pelo catálogo. URLs antigas de outro provider continuam válidas e a
remoção só alcança objetos reconhecidos como gerenciados pelo provider ativo.

## Checklist de ativação

1. Confirmar `JWT_SECRET` idêntico e com no mínimo 32 bytes no Node e no Java.
2. Confirmar backup do PostgreSQL e persistência do volume/bucket de imagens.
3. Subir PostgreSQL, Node, Java e frontend.
4. Confirmar `/actuator/health` do Java.
5. Fazer login pelo frontend com seller.
6. Criar um produto multipart e confirmar listagem, detalhe e imagem.
7. Atualizar o produto com outra imagem e confirmar a limpeza da anterior.
8. Excluir o produto e confirmar a limpeza do arquivo.
9. Chamar uma rota mantida no Node com o mesmo JWT para validar a convivência.

## Rollback

Defina `CATALOG_BACKEND_INTERNAL_URL` com o mesmo valor de
`BACKEND_INTERNAL_URL` e reconstrua/reinicie o frontend. O Node mantém as rotas
legadas de produto para esse rollback.

As migrations V3 e V4 são aditivas e compatíveis com o schema anterior, portanto
não devem ser revertidas. A V4 cria `categories`, preserva IDs legados positivos
e protege novas gravações com chave estrangeira. Produtos já gravados permanecem
na mesma tabela. Imagens locais precisam continuar montadas no volume durante um
rollback; objetos do Supabase permanecem acessíveis pela URL pública.
