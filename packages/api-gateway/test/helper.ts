import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/app.roles';
import { createRandomString } from '../src/common/utils';
import { User } from '../src/users/entities/user.entity';
import { AuthService } from '../src/auth/auth.service';
import { UserState } from '../src/common/constants';
import { UsersService } from '../src/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

export const buildServer = async (): Promise<NestFastifyApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  await clearDatabase(app);
  return app;
};

export const clearDatabase = async (app: NestFastifyApplication) => {
  const dataSource = app.get(DataSource);
  const entities = dataSource.entityMetadatas;

  for await (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
};

/**
 * Create new active user with the specified role
 * @param {NestFastifyApplication} app
 * @param {UserRole} role
 * @returns The created user
 */
export async function createUser(
  app: NestFastifyApplication,
  role = UserRole.MEMBER,
): Promise<{ user: User; password: string }> {
  const email = `${createRandomString()}@somesite.com`;
  const password = 'Test1234';
  const ip = '123.123.123.123';
  const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
  const authService = app.get(AuthService);
  const userService = app.get(UsersService);
  await authService.register(email, password, ip, ua);
  const user = (await userService.findByEmail(email)) as unknown as User;
  await userService.updateById(user.id, {
    state: UserState.ACTIVE,
    level: 1,
    verifyCode: null,
    verifyExpire: null,
    roles: role,
  });
  return {
    user: (await userService.findByEmail(email)) as unknown as User,
    password,
  };
}

export async function removeUser(id: string, app: NestFastifyApplication) {
  const service = app.get(UsersService);
  // @ts-expect-error user is private, don't want to make a getter only for this test utils
  return service.user.delete(id);
}

export async function removeResource(
  id: string,
  app: NestFastifyApplication,
  resourceService: any,
) {
  const service = app.get(resourceService);
  return service.deleteById(id, false);
}
