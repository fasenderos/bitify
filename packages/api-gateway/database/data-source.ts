import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import path from 'path';

const migrationsRun = process.env['POSTGRES_MIGRATIONS_RUN'] === 'true';
const synchronize = process.env['POSTGRES_SYNCHRONIZE'] === 'true';

if (synchronize) {
  console.warn(
    "Please make sure you don't turn on synchronization on production. Set 'POSTGRES_SYNCHRONIZE=false' in your .env file to disable synchronization.",
  );
}

if (migrationsRun && synchronize)
  throw new Error(
    "Synchronization and migration cannot be enabled at the same time. Set 'POSTGRES_SYNCHRONIZE=false' or 'POSTGRES_MIGRATIONS_RUN=false' in your .env file.",
  );

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['POSTGRES_HOST'] ?? '127.0.0.1',
  port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
  username: process.env['POSTGRES_USERNAME'] ?? 'postgres',
  password: process.env['POSTGRES_PASSWORD'] ?? 'postgres',
  database: process.env['POSTGRES_DATABASE'] ?? 'postgres',
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  migrationsRun,
  synchronize,
  entities: [path.join(__dirname, './../src/**/*.entity{.ts,.js}')],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
