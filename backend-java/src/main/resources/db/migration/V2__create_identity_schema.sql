CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20) NOT NULL DEFAULT 'customer'
               CHECK (role IN ('customer', 'seller', 'admin')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- New writes are normalized by the domain. This index also protects the legacy
-- table against duplicates that differ only by case or surrounding whitespace.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_normalized
    ON users (LOWER(BTRIM(email)));
