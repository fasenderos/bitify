import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(private readonly repo: Repository<T>) {}

  findAll(opts?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(opts);
  }

  findById(id: string): Promise<T | null> {
    // @ts-expect-error don't know why ts raise err: Argument of type '{ id: string; }' is not assignable to parameter of type 'FindOptionsWhere<T> | FindOptionsWhere<T>[]'
    return this.repo.findOneBy({ id });
  }

  async deleteById(id: string, soft = true): Promise<void> {
    await this.repo[soft ? 'softDelete' : 'delete'](id);
  }
}
