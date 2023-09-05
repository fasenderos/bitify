export enum Tables {}

export enum UserRole {
  // SUPER ADMIN has an access to the whole system without any limits
  SUPERADMIN = 1000,
  // ADMIN has nearly full access except managing permissions
  ADMIN = 1001,
  SUPPORT = 1002,
  MEMBER = 1,
}

export enum UserState {
  ACTIVE = 1,
  PENDING = 0,
  BANNED = -1,
}
