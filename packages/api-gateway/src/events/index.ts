export const EmailConfirmation = 'email.confirmation.token';
export interface EmailConfirmationDto {
  email: string;
  code: string;
}

export const EmailResetPassword = 'email.forgot.password';
export interface EmailResetPasswordDto {
  token: string;
  email: string;
}

export const ActivityRecord = 'system.activity.record';
export interface ActivityRecordDto {
  userId: string;
  userIP: string;
  userAgent: string;
  action: 'signup' | 'password.reset';
  result: 'succeed' | 'failes';
  topic: 'account' | 'password';
  data?: string;
}
