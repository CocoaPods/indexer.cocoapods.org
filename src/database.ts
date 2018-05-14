import { Pool } from 'pg';

export const trunk = new Pool({
    connectionString: process.env.TRUNK_DATABASE_URL,
    ssl: true
});

export const setup = async () => await trunk.connect();
