import { Client } from 'pg';

export const trunk = new Client(process.env.TRUNK_DATABASE_URL);

export const setup = async () => await trunk.connect();
