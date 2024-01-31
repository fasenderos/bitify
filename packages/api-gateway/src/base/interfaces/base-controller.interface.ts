import { DeepPartial, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../../users/entities/user.entity';

export class BaseCrudOptions<T> {
  // filter params to be used in find methods e.g. { state: 'active' }
  // if can be retrivied only entities in active state
  visibility?: Partial<T>;

  // Entity with `userId` column
  belongsToUser?: boolean;
}

export interface IBaseController<
  T extends ObjectLiteral & { userId?: string },
  C extends DeepPartial<T>,
  U extends QueryDeepPartialEntity<T>,
> {
  create(data: C, user: User): Promise<T>;
  findById(id: string, user: User): Promise<T | null>;
  findAll(user: User): Promise<T[]>;
  updateById(id: string, dto: U, user: User): Promise<void>;
  deleteById(id: string, user: User): Promise<void>;
}
