import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { IBaseService } from './interfaces/base-service.interface';
import { UnprocessableEntityException } from '@nestjs/common';

export abstract class BaseService<
  Entity extends BaseEntity,
  CreateDTO extends DeepPartial<Entity>,
  UpdateDTO extends QueryDeepPartialEntity<Entity>,
> implements IBaseService<Entity, CreateDTO, UpdateDTO>
{
  constructor(readonly repo: Repository<Entity>) {}

  /**
   * Instantiating the entity.
   * @param {CreateDTO} data The entity to be created
   * @param {string} userId The userId of the user owner of the resource
   * @returns The entity
   */
  createEntity(data: CreateDTO, userId: string): Entity {
    // Instantiating the entity before saving so hooks run
    return this.repo.create({ ...data, userId: userId });
  }

  /**
   * Saves a given entity in the database.
   * @param {Entity} data The entity to be created
   * @returns The created resource
   */
  save(data: Entity): Promise<Entity> {
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
   * @param {FindOptionsWhere<Entity>} filter The matching conditions for finding
   * @returns The entity that match the conditions or null.
   */
  findOne(filter: FindOptionsWhere<Entity>): Promise<Entity | null> {
    return this.repo.findOneBy(filter);
  }

  /**
   * Find entity by ID. If entity was not found in the database - returns null.
   * @param {string} id The ID of the entity
   * @returns The entity that match the conditions or null.
   */
  findById(id: string): Promise<Entity | null> {
    return this.findOne({ id } as FindOptionsWhere<Entity>);
  }

  /**
   * Updates entity by a given conditions.
   * Does not check if entity exist in the database.
   * @param {FindOptionsWhere<Entity>} filter The matching conditions for updating
   * @param {UpdateDTO} data The payload to update the entity
   */
  async update(
    filter: FindOptionsWhere<Entity>,
    data: UpdateDTO,
  ): Promise<void> {
    // @ts-expect-error Dto should not have userId, but we check anyway at runtime
    if (data.userId)
      throw new UnprocessableEntityException('Ownership can not be changed');

    await this.repo.update(filter, data);
  }

  /**
   * Updates entity partially by ID.
   * Does not check if entity exist in the database.
   * @param {string} id The ID of the entity to update
   * @param {UpdateDTO} data The payload to update the entity
   * @param {string} userId The userId of the user owner of the resource
   */
  async updateById(
    id: string,
    data: UpdateDTO,
    userId?: string,
  ): Promise<void> {
    // @ts-expect-error Dto should not have userId, but we check anyway at runtime
    if (data.userId)
      throw new UnprocessableEntityException('Ownership can not be changed');

    await this.repo.update(
      {
        id,
        ...(userId ? { userId: userId } : {}),
      } as FindOptionsWhere<Entity>,
      data,
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
