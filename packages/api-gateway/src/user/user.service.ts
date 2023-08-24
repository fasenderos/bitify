import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { hash } from 'bcrypt';
import { User } from './user.entity';
import {
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

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.user.findOneBy({ email });
  }

  async updateById(id: string, data: any): Promise<UpdateResult> {
    return this.user.update(id, data);
  }
}
