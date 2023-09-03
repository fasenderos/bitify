export const EmailConfirmation = 'email.confirmation.token';
export interface EmailConfirmationDto {
  email: string;
  code: number;
}

export const EmailResetPassword = 'email.forgot.password';
export interface EmailResetPasswordDto {
  token: string;
  email: string;
}
