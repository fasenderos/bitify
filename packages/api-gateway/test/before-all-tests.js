// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const clearDatabase = async () => {
  const client = new Client({
    user: process.env['POSTGRES_USERNAME'],
    host: process.env['POSTGRES_HOST'],
    database: process.env['POSTGRES_DATABASE'],
    password: process.env['POSTGRES_PASSWORD'],
    port: parseInt(process.env['POSTGRES_PORT'] ?? '5432'),
  });
  await client.connect();
  const allTables = `select table_schema||'.'||table_name as table_fullname
  from information_schema."tables"
  where table_type = 'BASE TABLE'
  and table_schema not in ('pg_catalog', 'information_schema');`;
  const results = await client.query(allTables);
  const tables = results.rows.map((res) => res.table_fullname.split('.')[1]);
  for await (const table of tables) {
    await client.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE;`);
  }
};

const run = async () => {
  await clearDatabase();
};

run().then(() => process.exit());
