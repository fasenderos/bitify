import { MigrationInterface, QueryRunner } from 'typeorm';
// import { Role } from '../../src/acl/roles/role.entity';
// import { UserRole } from '../../src/app.roles';
import { User } from '../../src/users/entities/user.entity';
import { hash } from 'bcrypt';

export class Seed1697284198292 implements MigrationInterface {
  name = 'Seed1697284198292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles
    // await queryRunner.manager
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Role)
    //   .values(
    //     Object.values(UserRole).map((role) => ({
    //       name: role,
    //     })),
    //   )
    //   .execute();

    // const roles = await queryRunner.manager.find(Role);
    // const rolesMap: Record<UserRole, string> = {} as Record<UserRole, string>;
    // roles.forEach((role) => {
    //   rolesMap[role.name as UserRole] = role.id;
    // });

    const superAdmin = {
      email: 'superadmin@bitify.com',
      level: 1,
      state: 1,
      passwordHash: await hash('superadmin', 10),
    };

    const member = {
      email: 'member@bitify.com',
      level: 1,
      state: 1,
      passwordHash: await hash('member', 10),
    };

    // const createdUser =
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([superAdmin, member])
      .execute();

    // await queryRunner.manager
    //   .createQueryBuilder()
    //   .insert()
    //   .into(UserRole)
    //   .values([
    //     {
    //       roleId: rolesMap[UserRole.SUPERADMIN],
    //       userId: createdUser.identifiers[0]?.['id'],
    //     },
    //     {
    //       roleId: rolesMap[UserRole.MEMBER],
    //       userId: createdUser.identifiers[1]?.['id'],
    //     },
    //   ])
    //   .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE roles RESTART IDENTITY CASCADE;`);
    await queryRunner.query(`TRUNCATE user_roles RESTART IDENTITY CASCADE;`);
    await queryRunner.query(`TRUNCATE users RESTART IDENTITY CASCADE;`);
  }
}
