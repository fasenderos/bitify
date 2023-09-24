import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseService<
  T extends BaseEntity & { userId?: string },
  C extends DeepPartial<T>,
  U extends QueryDeepPartialEntity<T>,
> {
  createEntity(data: C, userId: string): T;
  save(data: T): Promise<T>;
  find(options?: FindManyOptions<T>): Promise<T[]>;
  findOne(filter: FindOptionsWhere<T>, unselected?: boolean): Promise<T | null>;
  findById(id: string, unselected?: boolean): Promise<T | null>;
  update(filter: FindOptionsWhere<T>, data: U): Promise<UpdateResult>;
  updateById(id: string, data: U, userId?: string): Promise<UpdateResult>;
  delete(filter: FindOptionsWhere<T>, soft?: boolean): Promise<DeleteResult>;
  deleteById(
    id: string,
    userId?: string,
    soft?: boolean,
  ): Promise<DeleteResult>;
}
