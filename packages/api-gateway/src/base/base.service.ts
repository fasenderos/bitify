import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private readonly repo: Repository<Entity>) {}

  create(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repo.save(data);
  }

  /**
   * Finds entities that match given find options.
   * @param {FindManyOptions<Entity>} options The matching conditions for finding
   * @returns The entities that match the conditions.
   */
  find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repo.find(options);
  }

  /**
   * Finds first entity that matches given where condition.
   * If entity was not found in the database - returns null.
   * @param {FindOneOptions<Entity>} filter The matching conditions for finding
   * @returns The entity that match the conditions or null.
   */
  findOne(where: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repo.findOne(where);
  }

  /**
   * Find entity by ID. If entity was not found in the database - returns null.
   * @param {string} id The ID of the entity
   * @returns The entity that match the conditions or null.
   */
  findById(id: string): Promise<Entity | null> {
    // @ts-expect-error don't know why ts raise err: Argument of type '{ id: string; }' is not assignable to parameter of type 'FindOptionsWhere<T> | FindOptionsWhere<T>[]'
    return this.findOne({ where: { id } });
  }

  /**
   * Updates entity by a given conditions.
   * Does not check if entity exist in the database.
   * @param {FindOptionsWhere<Entity>} filter The matching conditions for updating
   * @param {UpdateDTO} data The payload to update the entity
   */
  async update(filter: FindOptionsWhere<Entity>, data: Entity): Promise<void> {
    await this.repo.update(filter, data as QueryDeepPartialEntity<Entity>);
  }

  /**
   * Updates entity partially by ID.
   * Does not check if entity exist in the database.
   * @param {string} id The ID of the entity to update
   * @param {Entity} data The payload to update the entity
   * @param {string} userId The userId of the user owner of the resource
   */
  async updateById(id: string, data: Entity, userId?: string): Promise<void> {
    await this.repo.update(
      {
        id,
        ...(userId ? { userId: userId } : {}),
      } as FindOptionsWhere<Entity>,
      data as QueryDeepPartialEntity<Entity>,
    );
  }

  /**
   * By default entities are soft deleted, which means an update of the deletedAt column.
   * The record still exists in the database but will not be retireved by any find/update query.
   * When `soft` is false the entity is truly deleted
   * @param {FindOptionsWhere<Entity>} filter The matching conditions for updating
   * @param {boolean} soft When true a soft delete is performed otherwise a real delete.
   */
  async delete(filter: FindOptionsWhere<Entity>, soft = true): Promise<void> {
    await this.repo[soft ? 'softDelete' : 'delete'](filter);
  }

  /**
   * By default entities are soft deleted, which means an update of the deletedAt column.
   * The record still exists in the database, but will not be retireved by any find/update query.
   * When `soft` is false the entity is truly deleted
   * @param {string} id The ID of the entity to update
   * @param {string} userId The userId of the user owner of the resource
   * @param {boolean} soft When true a soft delete is performed otherwise a real delete.
   */
  async deleteById(id: string, userId?: string, soft = true): Promise<void> {
    await this.repo[soft ? 'softDelete' : 'delete']({
      id,
      ...(userId ? { userId: userId } : {}),
    } as FindOptionsWhere<Entity>);
  }
}
