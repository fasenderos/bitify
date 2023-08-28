import { DataSource } from 'typeorm';

export const clearDatabase = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;

  for await (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
};
