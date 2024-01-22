export enum Collections {
  ACCOUNTS = 'accounts',
  ACTIVITIES = 'activities',
  APIKEYS = 'apikeys',
  BLOCKCHAINS = 'blockchains',
  CURRENCIES = 'currencies',
  DEPOSITS = 'deposits',
  MARKETS = 'markets',
  ORDERS = 'orders',
  PERMISSIONS = 'permissions',
  PROFILES = 'profiles',
  RECOVERY_TOKENS = 'recovery_tokens',
  RESOURCES = 'resources',
  ROLE_PERMISSIONS = 'role_permissions',
  ROLES = 'roles',
  TRADES = 'trades',
  TRADING_FEES = 'trading_fees',
  USER_ROLES = 'user_roles',
  USERS = 'users',
  WALLETS = 'wallets',
  WITHDRAWS = 'withdraws',
}

export enum UserState {
  ACTIVE = 1,
  PENDING = 0,
  BANNED = -1,
}

export enum State {
  ACTIVE = 1,
  INACTIVE = 0,
}
