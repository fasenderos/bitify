export interface I2FAResponse {
  twoFactorToken: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IEnable2FAResponse {
  secret: string;
  qrcode: string;
}
