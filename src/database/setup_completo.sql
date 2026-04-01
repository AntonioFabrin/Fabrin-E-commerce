-- ============================================================
-- FABRIN MARKETPLACE — SCRIPT COMPLETO DO BANCO DE DADOS
-- Execute este arquivo inteiro no HeidiSQL
-- Banco: ecommerce | Login: root | Senha: 1234
-- ============================================================

USE ecommerce;

-- ============================================================
-- 1. TABELA: users (já existe, só garante estrutura)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABELA: products (já existe, só garante estrutura)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    seller_id   INT NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    category_id INT DEFAULT 1,
    image_url   VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. TABELA: orders — atualiza colunas necessárias
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    total              DECIMAL(10,2) NOT NULL,
    status             VARCHAR(50) NOT NULL DEFAULT 'pending',
    external_reference VARCHAR(255) NULL,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Adiciona external_reference se não existir (para bancos já existentes)
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255) NULL AFTER status;

-- Garante default correto no status
ALTER TABLE orders
    MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- ============================================================
-- 4. TABELA: order_items (já existe, só garante estrutura)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    price      DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. TABELA: payments (já existe, verifica estrutura)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    payment_method   VARCHAR(50),
    payment_status   VARCHAR(50) DEFAULT 'pending',
    transaction_id   VARCHAR(255),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Adiciona index no transaction_id para o webhook ser rápido
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id
    ON payments(transaction_id);

-- ============================================================
-- 6. TABELA: reviews — NOVA (sistema de avaliações)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id    INT NOT NULL,
    order_id   INT NOT NULL,
    rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Impede avaliação duplicada do mesmo produto no mesmo pedido
    UNIQUE KEY uq_review (product_id, user_id, order_id),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE
);

-- ============================================================
-- VERIFICAÇÃO FINAL — rode para confirmar que tudo criou certo
-- ============================================================
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'ecommerce'
ORDER BY TABLE_NAME;
