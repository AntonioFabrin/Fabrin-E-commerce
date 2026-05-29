import type { PoolConfig } from 'pg';

const enabledSslValues = new Set(['true', '1', 'require', 'required', 'no-verify']);

const getSslConfig = () => {
    const sslMode = (process.env.DB_SSL || process.env.PGSSLMODE || '').toLowerCase();

    if (enabledSslValues.has(sslMode)) {
        return { rejectUnauthorized: false };
    }

    return undefined;
};

const getPoolMax = () => {
    const configuredPoolMax = Number(process.env.DB_POOL_MAX || process.env.PGPOOL_MAX);

    if (Number.isInteger(configuredPoolMax) && configuredPoolMax > 0) {
        return configuredPoolMax;
    }

    return process.env.VERCEL ? 1 : 10;
};

export const getPostgresConfig = (): PoolConfig => {
    const ssl = getSslConfig();
    const max = getPoolMax();

    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            max,
            ssl,
        };
    }

    return {
        host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
        port: Number(process.env.PGPORT || process.env.DB_PORT) || 5432,
        user: process.env.PGUSER || process.env.DB_USER || 'postgres',
        password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.PGDATABASE || process.env.DB_NAME || 'ecommerce',
        max,
        ssl,
    };
};
