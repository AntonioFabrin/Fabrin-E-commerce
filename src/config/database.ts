import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';
import { getPostgresConfig } from './postgres';

dotenv.config();

type QueryParams = readonly unknown[];

const toPostgresQuery = (query: string) => {
    let paramIndex = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    return query.replace(/['"?]/g, (char, offset) => {
        const previous = query[offset - 1];

        if (char === "'" && !inDoubleQuote && previous !== '\\') {
            inSingleQuote = !inSingleQuote;
            return char;
        }

        if (char === '"' && !inSingleQuote && previous !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            return char;
        }

        if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            paramIndex += 1;
            return `$${paramIndex}`;
        }

        return char;
    });
};

const normalizeResult = (result: QueryResult) => {
    if (result.command === 'SELECT') {
        return result.rows;
    }

    return {
        insertId: result.rows[0]?.id,
        affectedRows: result.rowCount ?? 0,
        rowCount: result.rowCount ?? 0,
        rows: result.rows,
    };
};

const pool = new Pool(getPostgresConfig());

const executeWithClient = async (client: Pool | PoolClient, query: string, params: QueryParams = []) => {
    const result = await client.query(toPostgresQuery(query), [...params]);
    return [normalizeResult(result), []];
};

const db = {
    execute: (query: string, params: QueryParams = []) => executeWithClient(pool, query, params),

    getConnection: async () => {
        const client = await pool.connect();

        return {
            execute: (query: string, params: QueryParams = []) => executeWithClient(client, query, params),
            beginTransaction: () => client.query('BEGIN'),
            commit: () => client.query('COMMIT'),
            rollback: () => client.query('ROLLBACK'),
            release: () => client.release(),
        };
    },
};

export default db;
