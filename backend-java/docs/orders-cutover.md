# Cutover incremental do módulo Orders

## Topologia do Bloco 4

- Java: identidade, catálogo e `/api/orders/**`.
- Node.js: `/api/payment/**`, avaliações, analytics e módulos ainda não migrados.
- Next.js decide o destino por módulo, usando `ORDERS_BACKEND_INTERNAL_URL`.
- Node e Java continuam usando o mesmo PostgreSQL e o mesmo `JWT_SECRET`.

```env
BACKEND_INTERNAL_URL=http://127.0.0.1:3333
IDENTITY_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
CATALOG_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
ORDERS_BACKEND_INTERNAL_URL=http://127.0.0.1:8080
```

O checkout continua apontando para `/api/payment/preference-cart`, portanto ainda
permanece no Node. Não se deve alterar esse encaminhamento no Bloco 4: o fluxo
atual do Mercado Pago cria o pedido internamente no backend Node. O Bloco 5 vai
substituir esse caminho por uma preferência formada a partir do pedido Java.

## Ativação

1. Aplicar Flyway até V5 e confirmar a tabela `stock_reservations`.
2. Configurar `ORDERS_BACKEND_INTERNAL_URL` para o Java e reconstruir o Next.
3. Testar `GET /api/orders/my` e `GET /api/orders/seller` pelo frontend.
4. Testar `POST /api/orders` com `Idempotency-Key`; o body só pode conter
   `items[].productId` (ou o alias temporário `product_id`) e `quantity`.
5. Testar o cancelamento de um pedido pendente em
   `PATCH /api/orders/{id}/cancel`.
6. Confirmar que `/api/payment/**` continua indo ao Node até o Bloco 5.

## Rollback

Configure `ORDERS_BACKEND_INTERNAL_URL` com o mesmo valor de
`BACKEND_INTERNAL_URL` e reconstrua/reinicie apenas o frontend. A migration V5
é aditiva: referências, chaves de idempotência e reservas permanecem no banco,
mas não impedem o Node de consultar suas tabelas legadas.
