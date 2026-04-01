-- ============================================================
-- EXECUTE ESSE SCRIPT NO SEU HEIDI SQL / MySQL WORKBENCH
-- Ele adiciona as colunas necessárias para o sistema de pedidos
-- ============================================================

-- 1. Adiciona external_reference na tabela orders (liga com o MP)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255) NULL AFTER status;

-- 2. Garante que a tabela orders tem a coluna status
ALTER TABLE orders 
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- Verificar resultado:
-- SELECT * FROM orders LIMIT 5;
-- SELECT * FROM payments LIMIT 5;
