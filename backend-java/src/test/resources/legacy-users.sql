CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20) NOT NULL DEFAULT 'customer'
               CHECK (role IN ('customer', 'seller', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role)
VALUES (
    'Admin Legado',
    'Admin.Legado@Example.com',
    '$2b$10$cCiru23si.gcSz3ogTW4EeSP.Ri8aRBBhkVOYgW62EIfH1Dm.gUyq',
    'admin'
);
