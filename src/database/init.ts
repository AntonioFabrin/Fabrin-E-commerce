import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { getPostgresConfig } from '../config/postgres';

const printDatabaseError = (error: unknown) => {
    if (error instanceof Error) {
        console.error(error.message || 'Erro sem mensagem do driver.');
    }

    const databaseError = error as NodeJS.ErrnoException & { host?: string; port?: number };

    if (databaseError.code) {
        console.error(`Codigo: ${databaseError.code}`);
    }

    if (databaseError.host || databaseError.port) {
        console.error(`Destino: ${databaseError.host || 'host desconhecido'}:${databaseError.port || 'porta desconhecida'}`);
    }
};

const main = async () => {
    const pool = new Pool(getPostgresConfig());
    const setupPath = path.resolve(__dirname, 'setup_completo.sql');
    const sql = await fs.readFile(setupPath, 'utf8');

    try {
        await pool.query(sql);
        console.log('Schema do banco criado/atualizado com sucesso.');
    } finally {
        await pool.end();
    }
};

main().catch((error) => {
    console.error('Falha ao inicializar o banco:');
    printDatabaseError(error);
    process.exit(1);
});
