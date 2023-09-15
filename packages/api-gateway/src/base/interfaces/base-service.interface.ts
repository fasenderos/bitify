import { DeepPartial, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseService<
  T extends BaseEntity,
  C extends DeepPartial<T>,
  U extends QueryDeepPartialEntity<T>,
> {
  createEntity(data: C, userId: string): T;
  save(data: T): Promise<T>;
  find(options?: FindManyOptions<T>): Promise<T[]>;
  findOne(filter: FindOptionsWhere<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  update(filter: FindOptionsWhere<T>, data: U): Promise<void>;
  updateById(id: string, data: U, userId?: string): Promise<void>;
  delete(filter: FindOptionsWhere<T>, soft?: boolean): Promise<void>;
  deleteById(id: string, userId?: string, soft?: boolean): Promise<void>;
}
