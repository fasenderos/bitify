export type EmptyObject = Record<string, never>;

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
  server: {
    address: string;
    port: number;
  };
}
