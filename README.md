# FabrinMarket — Marketplace Full Stack

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Mercado_Pago-Sandbox-00B1EA?style=for-the-badge" />
</p>

<p align="center">
  Marketplace completo desenvolvido do zero com Next.js, Node.js, TypeScript e PostgreSQL.<br/>
  Integração real com Mercado Pago (Pix, boleto e cartão), sistema de avaliações, carrinho persistente e painel do vendedor.
</p>

---

## Funcionalidades

### Autenticação & Usuários
- Cadastro e login com JWT (8h de expiração)
- Sistema de roles: `buyer`, `seller`, `admin`
- Proteção de rotas no servidor via `proxy.ts` do Next.js 16 (bloqueia antes de renderizar)
- Cookies de rota com `SameSite=Lax` e `Secure` quando o site roda em HTTPS
- Hook `useRequireAuth` centraliza verificação de auth no client-side

### Produtos
- CRUD completo com upload de imagem (Multer — validação de MIME type real, limite 5 MB)
- Vendedor só edita/exclui os próprios produtos; admin gerencia tudo
- Paginação na listagem pública

### Carrinho
- Context API global, persiste no `localStorage` entre sessões
- Suporte a múltiplos produtos e vendedores, controle de estoque

### Pagamentos — Mercado Pago
- Integração via SDK oficial v2
- Suporte a Pix, boleto e cartão (crédito/débito)
- Modo Sandbox completo
- Webhook para atualização automática de status do pedido

### Pedidos
- Pedido gravado no banco ao iniciar pagamento
- Status: `pending` → `paid` via webhook
- Aba Minhas Compras (comprador) e Pedidos Recebidos (vendedor)

### Avaliações
- Apenas quem comprou pode avaliar; bloqueio de duplicata por pedido
- Média de estrelas na vitrine via `bulk-stats`

### Interface
- Design premium com paleta roxa/creme — Playfair Display + Inter
- Toast system próprio (success/error/warning/info) — sem `alert()`
- Totalmente responsivo
- Auto-preenchimento de endereço via ViaCEP

---

## Arquitetura

### Backend

```
src/
├── config/         → Conexão PostgreSQL via pool (variáveis de ambiente)
├── controllers/    → Recebe requisições, delega para services
├── middlewares/    → Auth JWT + autorização por role + validação
├── repositories/   → Queries SQL (padrão Repository)
├── routes/         → Definição das rotas da API
├── services/       → Regras de negócio (inclui sellerService)
├── utils/          → Multer com validação de MIME type
└── validators/     → Validação de entrada (Zod/Joi)
```

Padrão: **Controller → Service → Repository**

### Frontend

```
frontend/
├── app/            → Páginas e rotas (Next.js App Router)
├── components/     → Componentes reutilizáveis (Toast, Button, Input…)
├── contexts/       → CartContext (carrinho global)
├── hooks/          → useAuth.ts (useRequireAuth, useCurrentUser, logout…)
├── lib/            → api.ts (instância axios + interceptor de token + extractErrorMessage)
│                    → authCookies.ts (cookies de login/logout para o proxy)
├── types/          → api.ts (interfaces centralizadas: Product, Order, Analytics…)
├── proxy.ts        → Proteção de rotas no servidor
└── .env.local      → Variáveis de ambiente (não versionado)
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Node.js, Express 5, TypeScript |
| Banco de dados | PostgreSQL 16 (pg) |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| Upload | Multer (MIME type validation, 5 MB limit) |
| Pagamentos | Mercado Pago SDK v2 |
| HTTP Client | Axios (instância centralizada com interceptor e baseURL via env) |
| Validação | Zod + Joi |

---

## Ajustes Recentes

- O backend raiz ficou apenas com dependências de backend; `next` foi removido dali.
- O client de produtos passou a usar o mesmo axios centralizado do restante do frontend.
- As cookies usadas pelo `proxy.ts` foram endurecidas com `SameSite=Lax`.
- As imagens remotas do Next agora ficam limitadas ao host configurado do backend e ao caminho `/uploads/**`.

---

## Banco de Dados

```sql
users         — id, name, email, password, role
products      — id, seller_id, name, description, price, stock, image_url
orders        — id, user_id, total, status, external_reference
order_items   — id, order_id, product_id, quantity, price
payments      — id, order_id, payment_method, payment_status, transaction_id
reviews       — id, product_id, user_id, order_id, rating, comment
```

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 16 rodando localmente
- Conta de desenvolvedor no [Mercado Pago](https://www.mercadopago.com.br/developers)

### 1. Clone o repositório

```bash
git clone https://github.com/AntonioFabrin/Fabrin-E-commerce.git
cd Fabrin-E-commerce
```

### 2. Configure as variáveis de ambiente do backend

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3333
JWT_SECRET=sua_chave_secreta_longa_e_aleatoria
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=ecommerce
MP_ACCESS_TOKEN=seu_access_token_sandbox
MP_PUBLIC_KEY=sua_public_key_sandbox
FRONTEND_URL=http://localhost:3000
```

### 3. Configure as variáveis de ambiente do frontend

```bash
cd frontend
cp .env.local.example .env.local   # ou crie manualmente
```

Conteúdo do `frontend/.env.local`:

```env
BACKEND_INTERNAL_URL=http://127.0.0.1:3333
# Local: deixe NEXT_PUBLIC_API_URL sem definir para o navegador usar /api pelo Next.
# NEXT_PUBLIC_API_URL=http://127.0.0.1:3333
```

### 4. Crie as tabelas no banco

Execute o arquivo `src/database/setup_completo.sql` no seu cliente PostgreSQL.

### 5. Instale dependências e rode o backend

```bash
# Na raiz do projeto
npm install
npm run dev
# -> http://127.0.0.1:3333
```

### 6. Instale dependências e rode o frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Variáveis de Ambiente

### Backend (`.env` na raiz)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão: 3333) |
| `JWT_SECRET` | Chave secreta do JWT — **obrigatória** |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL |
| `DB_USER` | Usuário do PostgreSQL |
| `DB_PASSWORD` | Senha do PostgreSQL |
| `DB_NAME` | Nome do banco |
| `DATABASE_URL` | URL completa do PostgreSQL; quando definida, tem prioridade sobre as variaveis `DB_*` |
| `SUPABASE_DIRECT_DATABASE_URL` | URL direta do Supabase, opcional para referencia/manutencao; o app usa `DATABASE_URL` |
| `DB_SSL` | Use `true` em bancos hospedados como Supabase |
| `DB_POOL_MAX` | Tamanho maximo do pool; use `1` em serverless/Vercel |
| `SUPABASE_URL` | URL do projeto Supabase, usada para enviar imagens ao Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave server-side do Supabase para upload no bucket; nao exponha no frontend |
| `SUPABASE_PRODUCTS_BUCKET` | Nome do bucket de imagens dos produtos |
| `MP_ACCESS_TOKEN` | Access Token do Mercado Pago |
| `MP_PUBLIC_KEY` | Public Key do Mercado Pago |
| `FRONTEND_URL` | URL do frontend (para CORS e redirects do MP) |

### Frontend (`frontend/.env.local`)

| Variável | Descrição |
|---|---|
| `BACKEND_INTERNAL_URL` | URL usada pelo Next para encaminhar `/api/*` e `/uploads/*` ao backend local |
| `NEXT_PUBLIC_API_URL` | Opcional. URL pública do backend quando o frontend precisa chamar uma API externa ao próprio domínio |

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/register` | Cadastro |
| POST | `/api/login` | Login + token JWT |

### Produtos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/products` | Pública | Lista paginada |
| GET | `/api/products/:id` | Pública | Detalhe |
| GET | `/api/products/seller` | JWT | Produtos do vendedor logado |
| POST | `/api/products` | JWT | Criar com imagem |
| PUT | `/api/products/:id` | JWT + dono | Editar |
| DELETE | `/api/products/:id` | JWT + dono | Remover |

### Pedidos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/orders/my` | JWT | Pedidos do comprador |
| GET | `/api/orders/seller` | JWT | Pedidos recebidos |

### Pagamentos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/api/payment/preference` | JWT | Preferência produto único |
| POST | `/api/payment/preference-cart` | JWT | Preferência carrinho |
| POST | `/api/payment/webhook` | Pública | Webhook Mercado Pago |

### Avaliações
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/api/reviews` | JWT | Criar avaliação |
| GET | `/api/reviews/product/:id` | Pública | Avaliações do produto |
| POST | `/api/reviews/bulk-stats` | Pública | Médias de múltiplos produtos |

### Vendedores
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/sellers/:id/profile` | Pública | Perfil público do vendedor |
| GET | `/api/sellers/analytics` | JWT | Dados financeiros do vendedor |

---

## Fluxo de Pagamento

```
Usuário → "Comprar Agora" / "Finalizar Carrinho"
       → Preenche endereço
       → Backend cria Preference no Mercado Pago
       → Redirect para Checkout Pro (sandbox)
       → Pagamento com Pix / Boleto / Cartão de teste
       → Webhook notifica backend → pedido atualizado para "paid"
       → Redirect para /orders?status=sucesso
```

---

## Deploy

| Serviço | Plataforma | Observação |
|---|---|---|
| Backend | Vercel | O Express em `src/index.ts` exporta o app para rodar como Vercel Function |
| Frontend | Vercel | Configurar `NEXT_PUBLIC_API_URL` nas env vars |

### Backend na Vercel com Supabase

No projeto do backend na Vercel, configure as variaveis:

```env
DATABASE_URL=cole_a_string_exata_do_supabase_transaction_pooler
SUPABASE_DIRECT_DATABASE_URL=cole_a_string_direta_do_supabase
DB_SSL=true
DB_POOL_MAX=1
SUPABASE_URL=https://seu-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key
SUPABASE_PRODUCTS_BUCKET=product-images
JWT_SECRET=sua_chave_longa_e_aleatoria
FRONTEND_URL=https://url-do-frontend.vercel.app
MP_ACCESS_TOKEN=seu_token_sandbox_ou_prod
MP_PUBLIC_KEY=sua_public_key
```

Para Supabase em Vercel, copie a connection string em `Connect -> Transaction pooler`. Para testar localmente ou rodar `npm run db:init`, a `Session pooler` tambem funciona, mas a string precisa ser copiada exatamente do painel.

Depois de configurar o banco:

```bash
npm run db:check
npm run db:init
npm run db:storage
npm run build
```

O script `db:storage` cria/atualiza o bucket publico `product-images` no Supabase e permite leitura publica das imagens. O backend usa Multer em memoria e envia os arquivos para esse bucket antes de salvar a URL publica no banco.

---

## Docker

O projeto agora inclui `docker-compose.yml` com:
- `db`: PostgreSQL 16 com scripts de schema em `src/database/`
- `backend`: API Node/Express
- `frontend`: Next.js
- `frontend` usa `/api/*` na mesma origem e `BACKEND_INTERNAL_URL` para rewrites internas no container

### Subir tudo

```bash
docker compose up --build
```

### Portas

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:3333`
- PostgreSQL: `localhost:5432`

### Observação

Se você quiser usar seus próprios tokens do Mercado Pago ou credenciais do banco, mantenha o `.env` na raiz preenchido antes de subir o backend.

---

## Autor

**Antonio Fabrin Neto**  
[GitHub](https://github.com/AntonioFabrin) · [LinkedIn](https://linkedin.com/in/antonio-fabrin)

---

## Licença

MIT
