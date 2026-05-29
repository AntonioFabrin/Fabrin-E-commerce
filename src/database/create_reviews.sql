-- ============================================================
-- Cria a tabela de avaliacoes de produtos - PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    order_id   INTEGER NOT NULL,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_review UNIQUE (product_id, user_id, order_id),

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
