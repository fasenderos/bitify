import { name, version } from '../package.json';
import { AppConfig } from '../typings/common';

function ensureValues(key: string, throwOnMissing = true): string {
  const value = process.env[key];
  if (value === undefined && throwOnMissing) {
    throw new Error(`config error - missing env.${key}`);
  }
  return value as string;
}

export enum TokenTypes {
  ACCESS = 'access',
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export const COOKIES = {
  PAYLOAD: `${name}_user`,
  HEADER_SIGNATURE: `${name}_token`,
  SESSION: `${name}_session`,
};

export default (): AppConfig => ({
  app: {
    name,
    version,
  },
  auth: {
    expAccessToken: '15m',
    expRefreshToken: '7d',
    expVerifyMail: '8m',
    expResetPassword: '8m',
    secretAccessToken: ensureValues('JWT_SECRET_ACCESS_TOKEN'),
    secretRefreshToken: ensureValues('JWT_SECRET_REFRESH_TOKEN'),
  },
  db: {
    host: ensureValues('POSTGRES_HOST'),
    port: parseInt(ensureValues('POSTGRES_PORT'), 10),
    username: ensureValues('POSTGRES_USERNAME'),
    password: ensureValues('POSTGRES_PASSWORD'),
    database: ensureValues('POSTGRES_DATABASE'),
  },
  server: {
    address: ensureValues('SERVER_ADDRESS'),
    port: parseInt(ensureValues('SERVER_PORT'), 10),
  },
});
