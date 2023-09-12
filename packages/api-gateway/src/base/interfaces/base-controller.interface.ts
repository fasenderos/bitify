import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../../user/entities/user.entity';

export interface IBaseController<
  T extends BaseEntity,
  C extends DeepPartial<T>,
  U extends QueryDeepPartialEntity<T>,
> {
  create(data: C, user: User): Promise<T>;
  findById(id: string, user: User): Promise<T | null>;
  findAll(user: User): Promise<T[]>;
  updateById(id: string, dto: U, user: User): Promise<void>;
  deleteById(id: string, user: User): Promise<void>;
}
