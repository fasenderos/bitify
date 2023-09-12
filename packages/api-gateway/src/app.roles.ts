import { RolesBuilder } from 'nest-access-control';
import { Collections } from './common/constants';

const { API_KEYS } = Collections;

export enum UserRole {
  // SUPER ADMIN has an access to the whole system without any limits
  SUPERADMIN = 'superadmin',
  // ADMIN has nearly full access except managing permissions
  ADMIN = 'admin',
  SUPPORT = 'support',
  MEMBER = 'member',
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  // ******* MEMBER ACL ******* //
  .grant(UserRole.MEMBER)
  .createOwn([API_KEYS])
  .readOwn([API_KEYS])
  .updateOwn([API_KEYS])
  .deleteOwn([API_KEYS]);

// ******* SUPPORT ACL ******* //

// ******* ADMIN ACL ******* //

// ******* SUPERADMIN ACL ******* //
