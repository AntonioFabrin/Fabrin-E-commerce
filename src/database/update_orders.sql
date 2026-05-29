-- ============================================================
-- Ajustes da tabela de pedidos - PostgreSQL
-- ============================================================

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255) NULL;

UPDATE orders
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE orders
ALTER COLUMN status SET NOT NULL;
