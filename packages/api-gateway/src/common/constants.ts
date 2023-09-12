export enum Collections {
  ACTIVITIES = 'activities',
  API_KEYS = 'api_keys',
  RECOVERY_TOKENS = 'recovery_tokens',
  USERS = 'users',
}

export enum UserState {
  ACTIVE = 1,
  PENDING = 0,
  BANNED = -1,
}
