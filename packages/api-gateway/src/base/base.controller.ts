import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Type,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AbstractValidationPipe } from '../common/pipes/abstract-validation.pipe';
import { IBaseController } from './interfaces/base-controller.interface';
import { IBaseService } from './interfaces/base-service.interface';
import { BaseEntity } from './base.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserRole } from '../app.roles';
import { DeepPartial, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Collections } from '../common/constants';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { ACGuard, UseRoles } from 'nest-access-control';

/**
 * Every controller in the application can use the ControllerFactory in order
 * to avoid code duplication. Magically you have all CRUD methods to create, read,
 * updated and delete an entity protected by the Role Base ACL and the api documentaion.
 */
export function ControllerFactory<
  Entity extends BaseEntity,
  CreateDTO extends DeepPartial<Entity>,
  UpdateDTO extends QueryDeepPartialEntity<Entity>,
>(
  createDto: Type<CreateDTO>,
  updateDto: Type<UpdateDTO>,
  resource: Collections,
): Type<IBaseController<Entity, CreateDTO, UpdateDTO>> {
  const createPipe = new AbstractValidationPipe(
    {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    },
    { body: createDto },
  );
  const updatePipe = new AbstractValidationPipe(
    {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    },
    { body: updateDto },
  );

  class BaseController<
    Entity extends BaseEntity,
    CreateDTO extends DeepPartial<Entity>,
    UpdateDTO extends QueryDeepPartialEntity<Entity>,
  > implements IBaseController<Entity, CreateDTO, UpdateDTO>
  {
    protected readonly service: IBaseService<Entity, CreateDTO, UpdateDTO>;
    constructor(service: IBaseService<Entity, CreateDTO, UpdateDTO>) {
      this.service = service;
    }

    /**
     * Create a given entity
     * @param {CreateDTO} dto The entity to be created
     * @param {User} user The user that is making the request
     * @returns The created resource
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtGuard, ACGuard)
    @UseRoles({ resource, action: 'create', possession: 'own' })
    @UsePipes(createPipe)
    @ApiBearerAuth()
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The record has been successfully created.',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized.',
    })
    create(@Body() dto: CreateDTO, @CurrentUser() user: User): Promise<Entity> {
      // Create owned resource
      return this.service.create(dto, user.id);
    }

    /**
     * Find entity by ID. If entity was not found in the database - returns null.
     * @param {string} id The ID of the entity
     * @param {User} user The user that is making the request
     * @returns The entity that match the conditions or null.
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard, ACGuard)
    @UseRoles({ resource, action: 'read', possession: 'own' })
    @ApiBearerAuth()
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Return the record or null.',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized.',
    })
    findById(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: User,
    ): Promise<Entity | null> {
      // Admin can view any resource
      if (user.role.includes(UserRole.ADMIN)) {
        return this.service.findById(id);
      }
      // Member can view owned resource only
      return this.service.findOne({
        id,
        userId: user.id,
      } as unknown as FindOptionsWhere<Entity>);
    }

    /**
     * Find all entities.
     * @param {User} user The user that is making the request
     * @returns All the entities
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard, ACGuard)
    @UseRoles({ resource, action: 'read', possession: 'own' })
    @ApiBearerAuth()
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Return an array of records.',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized.',
    })
    findAll(@CurrentUser() user: User): Promise<Entity[]> {
      // Admin can view any resources
      if (user.role.includes(UserRole.ADMIN)) {
        return this.service.find();
      }
      // Member can view owned resources only
      return this.service.find({
        where: { userId: user.id },
      } as unknown as FindManyOptions<Entity>);
    }

    /**
     * Updates entity by a given conditions.
     * @param {string} id The ID of the entity
     * @param {UpdateDTO} dto The payload to update the entity
     * @param {User} user The user that is making the request
     * @returns NO_CONTENT
     */
    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard, ACGuard)
    @UseRoles({ resource, action: 'update', possession: 'own' })
    @UsePipes(updatePipe)
    @ApiBearerAuth()
    @ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The record has been successfully updated.',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized.',
    })
    async updateById(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateDTO,
      @CurrentUser() user: User,
    ): Promise<void> {
      // Update owned resource
      await this.service.updateById(id, dto, user.id);
    }

    /**
     * Soft delete entity by ID, which means an update of the deletedAt column.
     * The record still exists in the database, but will not be retireved by any find/update query.
     * @param {string} id The ID of the entity
     * @param {User} user The user that is making the request
     * @returns NO_CONTENT
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard, ACGuard)
    @UseRoles({ resource, action: 'delete', possession: 'own' })
    @ApiBearerAuth()
    @ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The record has been successfully deleted.',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized.',
    })
    async deleteById(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: User,
    ): Promise<void> {
      // Delete owned resource
      await this.service.deleteById(id, user.id);
    }
  }

  return BaseController;
}
