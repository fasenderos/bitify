import { name, version } from '../package.json';
import { AppConfig } from '../typings/common';

function ensureValues(
  key: string,
  defaultValue?: string,
  throwOnMissing = true,
): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      console.error(
        `Config missing env.${key} - the default value '${defaultValue}' will be used`,
      );
      return defaultValue;
    }
    if (throwOnMissing) throw new Error(`Config missing env.${key}`);
  }
  return value as string;
}

export enum TokenTypes {
  ACCESS = 'access',
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export default (): AppConfig => {
  return {
    app: {
      name,
      version,
    },
    auth: {
      exp2FAToken: '2m',
      expAccessToken: '15m',
      expRefreshToken: '7d',
      expVerifyMail: '8m',
      expResetPassword: '8m',
      secret2FAToken: ensureValues('JWT_SECRET_2FA_TOKEN', 'CHANGE-2FA-TOKEN'),
      secretAccessToken: ensureValues(
        'JWT_SECRET_ACCESS_TOKEN',
        'CHANGE-ACCESS-TOKEN',
      ),
      secretRefreshToken: ensureValues(
        'JWT_SECRET_REFRESH_TOKEN',
        'CHANGE-REFRESH-TOKEN',
      ),
    },
    db: {
      host: ensureValues('POSTGRES_HOST', '127.0.0.1'),
      port: parseInt(ensureValues('POSTGRES_PORT', '5432'), 10),
      username: ensureValues('POSTGRES_USERNAME', 'postgres'),
      password: ensureValues('POSTGRES_PASSWORD', 'postgres'),
      database: ensureValues('POSTGRES_DATABASE', 'postgres'),
    },
    email: {
      transport: ensureValues('EMAIL_TRANSPORT', undefined, false),
      from: ensureValues('EMAIL_FROM', undefined),
    },
    encryption: {
      secret: ensureValues('ENCRYPTION_KEY', 'CHANGE-ENCRYPTION-KEY'),
    },
    frontend: {
      baseUrl: ensureValues('FRONTEND_BASE_URL', undefined, true),
    },
    server: {
      address: ensureValues('SERVER_ADDRESS', '127.0.0.1'),
      port: parseInt(ensureValues('SERVER_PORT', '3001'), 10),
    },
  };
};
