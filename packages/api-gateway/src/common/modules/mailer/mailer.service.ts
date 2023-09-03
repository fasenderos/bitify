import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EmailConfirmation,
  EmailConfirmationDto,
  EmailResetPassword,
  EmailResetPasswordDto,
} from '../../../events';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  appName: string;
  frontendBaseUrl: string;
  constructor(
    private readonly mail: MailerService,
    private readonly config: ConfigService,
  ) {
    this.appName = this.config.get<string>('app.name') as string;
    this.frontendBaseUrl = this.config.get<string>(
      'frontend.baseUrl',
    ) as string;
  }
  @OnEvent(EmailConfirmation)
  async emailConfirmation({ email, code }: EmailConfirmationDto) {
    await this.mail.sendMail({
      to: email,
      subject: `Welcome to ${this.appName}! Confirm your Email`,
      template: 'email-confirmation',
      context: { code, appName: this.appName },
    });
  }

  @OnEvent(EmailResetPassword)
  async emailResetPassword({ email, token }: EmailResetPasswordDto) {
    const resetUrl = `${this.frontendBaseUrl}/auth/reset-password?token=${token}`;
    await this.mail.sendMail({
      to: email,
      subject: `Reset your ${this.appName} password`,
      template: 'email-reset-password',
      context: { url: resetUrl, appName: this.appName },
    });
  }
}
