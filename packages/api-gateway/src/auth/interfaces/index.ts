export interface I2FAResponse {
  twoFactorToken: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface I2FaEnabled {
  otpCodes: number[];
}

export interface IEnable2FAResponse {
  secret: string;
  qrcode: string;
}
