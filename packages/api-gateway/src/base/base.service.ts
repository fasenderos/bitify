import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  protected repo!: Repository<T>;

  async findAll(opts?: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(opts);
  }

  async findById(id: string): Promise<T | null> {
    // @ts-expect-error don't know why ts raise err: Argument of type '{ id: string; }' is not assignable to parameter of type 'FindOptionsWhere<T> | FindOptionsWhere<T>[]'
    return await this.repo.findOneBy({ id });
  }
}
