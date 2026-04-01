-- ============================================================
-- EXECUTE NO HEIDI SQL / MySQL WORKBENCH
-- Cria a tabela de avaliações de produtos
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    user_id     INT NOT NULL,
    order_id    INT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Um usuário só pode avaliar o mesmo produto uma vez por pedido
    UNIQUE KEY uq_review (product_id, user_id, order_id),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE
);

-- Verificar:
-- SELECT * FROM reviews;
