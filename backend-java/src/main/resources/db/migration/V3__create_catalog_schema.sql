CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    seller_id   INTEGER NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL DEFAULT 1,
    image_url   TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_seller
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
UPDATE products SET category_id = 1 WHERE category_id IS NULL;
UPDATE products SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
ALTER TABLE products ALTER COLUMN category_id SET DEFAULT 1;
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_positive') THEN
        ALTER TABLE products
            ADD CONSTRAINT chk_products_price_positive CHECK (price > 0) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative') THEN
        ALTER TABLE products
            ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_category_positive') THEN
        ALTER TABLE products
            ADD CONSTRAINT chk_products_category_positive CHECK (category_id > 0) NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
