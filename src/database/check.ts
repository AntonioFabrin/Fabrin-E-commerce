import 'dotenv/config';
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

    try {
        const result = await pool.query(
            'SELECT current_database() AS database, current_user AS user, now() AS connected_at'
        );

        console.log('Banco conectado com sucesso:');
        console.table(result.rows);
    } finally {
        await pool.end();
    }
};

main().catch((error) => {
    console.error('Falha ao conectar no banco:');
    printDatabaseError(error);
    process.exit(1);
});
