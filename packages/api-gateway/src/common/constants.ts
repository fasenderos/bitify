export enum Collections {
  ACTIVITIES = 'activities',
  APIKEYS = 'apikeys',
  RECOVERY_TOKENS = 'recovery_tokens',
  PROFILES = 'profiles',
  USERS = 'users',
}

export enum UserState {
  ACTIVE = 1,
  PENDING = 0,
  BANNED = -1,
}
