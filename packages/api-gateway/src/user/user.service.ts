import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { compare, hash } from 'bcrypt';
import { User } from './entities/user.entity';
import {
  FindOptionsWhere,
  InsertResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';

interface IUserCreate {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  public findById(userId: string) {
    return this.user.findOneBy({ id: userId });
  }

  public async createUser({
    email,
    password,
  }: IUserCreate): Promise<InsertResult> {
    const passwordHash = await hash(password, 10);
    try {
      return await this.user.insert({ email, passwordHash });
    } catch (error: any) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError as DatabaseError;
        if (err.code === '23505') {
          throw new ConflictException('Email already registered');
        }
      }
      throw new BadRequestException();
    }
  }

  async validateUserPassword(email: string, password: string): Promise<User> {
    const user = await this.getUserWithUnselected({ email });

    if (user === null)
      throw new UnauthorizedException(
        'You have entered an invalid email or password',
      );

    const match = await compare(password, user.passwordHash);
    if (!match)
      throw new UnauthorizedException(
        'You have entered an invalid email or password',
      );

    return user;
  }

  getUserWithUnselected(where: FindOptionsWhere<User>) {
    return this.user.findOne({
      select: this.getAllTableColumns(),
      where,
    });
  }

  async updateById(id: string, data: any): Promise<UpdateResult> {
    return this.user.update(id, data);
  }

  private getAllTableColumns(): (keyof User)[] {
    return this.user.metadata.columns.map(
      (col) => col.propertyName,
    ) as (keyof User)[];
  }
}
