# FabrinMarket — Marketplace Full Stack

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Mercado_Pago-Sandbox-00B1EA?style=for-the-badge" />
</p>

<p align="center">
  Marketplace completo desenvolvido do zero com Next.js, Node.js, TypeScript e MySQL.<br/>
  Integração real com Mercado Pago (Pix, boleto e cartão), sistema de avaliações, carrinho persistente e painel do vendedor.
</p>

---

## Demonstração

> **Backend:** `http://localhost:3333`  
> **Frontend:** `http://localhost:3000`

---

## Funcionalidades

### Autenticação & Usuários
- Cadastro e login com JWT (8h de expiração)
- Sistema de roles: `buyer`, `seller`, `admin`
- Rotas protegidas por middleware de autenticação e autorização

### Produtos
- CRUD completo de produtos com upload de imagem (Multer)
- Vendedor só edita/exclui os próprios produtos
- Admin pode gerenciar qualquer produto
- Paginação na listagem pública

### Carrinho de Compras
- Carrinho global com Context API
- Persiste no `localStorage` entre sessões
- Suporte a múltiplos produtos e vendedores
- Controle de quantidade respeitando estoque

### Pagamentos — Mercado Pago
- Integração via SDK oficial do Mercado Pago
- Suporte a Pix, boleto e cartão (crédito/débito)
- Modo Sandbox completo (sem dinheiro real)
- Preferência única para produto avulso ou carrinho inteiro
- Webhook para atualização automática de status do pedido

### Pedidos
- Pedido gravado no banco ao iniciar o pagamento
- Status: `pending` → `paid` (via webhook do MP)
- Aba **Minhas Compras** para o comprador
- Aba **Pedidos Recebidos** para o vendedor (com dados do comprador)

### Avaliações & Estrelas
- Apenas quem comprou o produto pode avaliar
- Bloqueio de avaliação duplicada por pedido
- Média de estrelas exibida em cada card da vitrine
- Modal interativo com seletor de estrelas e comentário

### Interface
- Design premium com paleta roxa/creme
- Fontes: Playfair Display (display) + Inter (corpo)
- Totalmente responsivo
- Modo Vendedor e Modo Admin com faixas visuais distintas
- Auto-preenchimento de endereço via CEP (ViaCEP)

---

## Arquitetura do Backend

```
src/
├── config/         # Conexão com o banco MySQL
├── controllers/    # Recebe requisições e retorna respostas
├── middlewares/    # Auth JWT + autorização por role
├── models/         # Tipagens e interfaces
├── repositories/   # Queries SQL diretas (padrão Repository)
├── routes/         # Definição das rotas da API
├── services/       # Regras de negócio
├── utils/          # Multer (upload), helpers
└── validators/     # Validação de dados de entrada
```

O backend segue o padrão **Controller → Service → Repository**, garantindo separação clara de responsabilidades e facilitando manutenção e testes.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Node.js, Express 5, TypeScript |
| Banco de dados | MySQL 8 (via mysql2) |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| Upload de arquivos | Multer |
| Pagamentos | Mercado Pago SDK v2 |
| Estilização | Tailwind CSS v4 + CSS inline |
| HTTP Client | Axios |
| Validação | Zod + Joi |

---

## Estrutura do Banco de Dados

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
- MySQL 8 rodando localmente
- Conta de desenvolvedor no [Mercado Pago](https://www.mercadopago.com.br/developers)

### 1. Clone o repositório

```bash
git clone https://github.com/AntonioFabrin/Fabrin-E-commerce.git
cd Fabrin-E-commerce
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Crie as tabelas no banco

Execute o arquivo `src/database/setup_completo.sql` no seu cliente MySQL (HeidiSQL, Workbench, etc.).

### 4. Instale as dependências e rode o backend

```bash
npm install
npm run dev
# Rodando em http://localhost:3333
```

### 5. Instale as dependências e rode o frontend

```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:3000
```

---

## Variáveis de Ambiente

Veja o arquivo `.env.example` na raiz do projeto com todas as variáveis necessárias.

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/register` | Cadastro de usuário |
| POST | `/api/login` | Login e geração de token |

### Produtos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/products` | Pública | Lista produtos paginados |
| GET | `/api/products/:id` | Pública | Detalhe de produto |
| GET | `/api/products/seller` | JWT | Produtos do vendedor logado |
| POST | `/api/products` | JWT + seller | Criar produto com imagem |
| PUT | `/api/products/:id` | JWT + dono | Editar produto |
| DELETE | `/api/products/:id` | JWT + dono | Remover produto |

### Pedidos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/orders/my` | JWT | Pedidos do comprador |
| GET | `/api/orders/seller` | JWT | Pedidos recebidos pelo vendedor |

### Pagamentos
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/api/payment/preference` | JWT | Cria preferência (produto único) |
| POST | `/api/payment/preference-cart` | JWT | Cria preferência (carrinho) |
| POST | `/api/payment/webhook` | Pública | Webhook do Mercado Pago |

### Avaliações
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/api/reviews` | JWT | Criar avaliação |
| GET | `/api/reviews/product/:id` | Pública | Avaliações de um produto |
| POST | `/api/reviews/bulk-stats` | Pública | Médias de múltiplos produtos |

---

## Fluxo de Pagamento

```
Cliente → "Comprar Agora" ou "Finalizar Carrinho"
       → Preenche endereço de entrega
       → Backend cria Preference no Mercado Pago
       → Redireciona para o Checkout Pro (sandbox)
       → Cliente paga com Pix / Boleto / Cartão de teste
       → MP notifica o webhook → pedido atualizado para "paid"
       → Cliente redirecionado para /orders?status=sucesso
```

---

## Autor

**Antonio Fabrin Neto**  
[GitHub](https://github.com/AntonioFabrin) · [LinkedIn](https://linkedin.com/in/antonio-fabrin)

---

## Licença

Este projeto está sob a licença MIT.
