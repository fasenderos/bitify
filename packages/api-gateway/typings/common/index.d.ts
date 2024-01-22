export type EmptyObject = Record<string, never>;
export type ObjectLiteral = Record<string, any>;

export interface AppConfig {
  app: {
    name: string;
    version: string;
  };
  auth: {
    exp2FAToken: string;
    expAccessToken: string;
    expRefreshToken: string;
    expVerifyMail: string;
    expResetPassword: string;
    recaptchaSecret: string;
    secret2FAToken: string;
    secretAccessToken: string;
    secretRefreshToken: string;
  };
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  email: {
    transport: string;
    from: string;
  };
  encryption: {
    secret: string;
  };
  frontend: {
    baseUrl: string;
  };
  server: {
    address: string;
    port: number;
  };
}
