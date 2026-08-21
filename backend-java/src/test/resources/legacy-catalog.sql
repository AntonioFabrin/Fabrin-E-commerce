CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    seller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER DEFAULT 1,
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email, password, role)
VALUES
    (10, 'Vendedor Legado', 'seller.legacy@example.com', '$2b$10$legacy', 'seller'),
    (20, 'Cliente Legado', 'customer.legacy@example.com', '$2b$10$legacy', 'customer');

INSERT INTO products (id, seller_id, name, description, price, stock, category_id, image_url, created_at)
VALUES
    (100, 10, 'Produto Antigo', 'Linha legada', 19.90, 3, NULL, '/uploads/legacy.png', '2025-01-01 10:00:00'),
    (101, 10, 'Produto Recente', 'Linha legada', 29.90, 5, 1, '/uploads/recent.png', '2025-02-01 10:00:00');

SELECT setval('users_id_seq', 20, true);
SELECT setval('products_id_seq', 101, true);
