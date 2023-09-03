import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private readonly repo: Repository<Entity>) {}

  create(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repo.save(data);
  }

  findAll(where?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repo.find(where);
  }

  findOne(where: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repo.findOne(where);
  }

  findById(id: string): Promise<Entity | null> {
    // @ts-expect-error don't know why ts raise err: Argument of type '{ id: string; }' is not assignable to parameter of type 'FindOptionsWhere<T> | FindOptionsWhere<T>[]'
    return this.findOne({ where: { id } });
  }

  updateById(id: string, data: Entity): Promise<UpdateResult> {
    return this.repo.update(id, data as QueryDeepPartialEntity<Entity>);
  }

  async deleteById(id: string, soft = true): Promise<void> {
    await this.repo[soft ? 'softDelete' : 'delete'](id);
  }
}
