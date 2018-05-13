import { Client } from 'pg';

export const trunk = new Client(process.env.TRUNK_DATABASE_URL);
trunk.ssl = true;

export const setup = async () => await trunk.connect();
