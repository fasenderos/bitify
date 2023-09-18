import { RolesBuilder } from 'nest-access-control';
import { Collections } from './common/constants';

const { APIKEYS } = Collections;

export enum UserRole {
  // SUPER ADMIN has an access to the whole system without any limits
  SUPERADMIN = 'superadmin',
  // ADMIN has nearly full access except managing permissions
  ADMIN = 'admin',
  SUPPORT = 'support',
  MEMBER = 'member',
}

export enum ApiKeyAbility {
  READ = 'read',
  READ_WRITE = 'read-write',
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  // ******* MEMBER ACL ******* //
  .grant(UserRole.MEMBER)
  .createOwn([APIKEYS])
  .readOwn([APIKEYS])
  .updateOwn([APIKEYS])
  .deleteOwn([APIKEYS]);
