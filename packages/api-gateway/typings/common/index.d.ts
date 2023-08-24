export type EmptyObject = {
  [K in any]: never
}

export interface AppConfig {
  app: {
    name: string
    version: string
  }
  auth: {
    expAccessToken: string
    expRefreshToken: string
    expVerifyMail: string
    expResetPassword: string
    secretAccessToken: string
    cookieSecret: string
  }
  db: {
    host: string
    port: number
    username: string
    password: string
    database: string
  }
  server: {
    address: string
    port: number
  }
}
