import {
  Controller,
  Body,
  ValidationPipe,
  Post,
  Headers,
  Get,
  UseGuards,
  UsePipes,
  HttpCode,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Jwt2FAGuard } from './guards/jwt-2fa.guard';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SanitizeTrimPipe } from '../common/pipes/sanitize-trim.pipe';
import { I2FAResponse, IEnable2FAResponse, ILoginResponse } from './interfaces';
import {
  ConfirmEmailDto,
  ResendConfirmEmailDto,
} from './dto/confirm-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UsePipes(new SanitizeTrimPipe())
  register(
    @Body(ValidationPipe) dto: RegisterDto,
    @RealIP() userIP: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<void> {
    const { email, password, recaptchaToken } = dto;
    return this.auth.register(
      email,
      password,
      userIP,
      userAgent,
      recaptchaToken,
    );
  }

  @Post('login')
  @UsePipes(new SanitizeTrimPipe())
  @HttpCode(200)
  login(
    @Body(ValidationPipe) dto: LoginDto,
    @RealIP() userIP: string,
  ): Promise<ILoginResponse | I2FAResponse> {
    const { email, password, recaptchaToken } = dto;
    return this.auth.login(email, password, userIP, recaptchaToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@Headers('Authorization') auth: string): Promise<void> {
    return this.auth.logout(auth);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  refreshToken(
    @Headers('Authorization') auth: string,
  ): Promise<ILoginResponse> {
    return this.auth.refreshToken(auth);
  }

  // Controller to verify OTP
  @ApiBearerAuth()
  @UseGuards(Jwt2FAGuard)
  @Post('otp')
  @UsePipes(new SanitizeTrimPipe())
  @HttpCode(200)
  async verifyOTP(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) dto: VerifyOTPDto,
  ): Promise<ILoginResponse> {
    await this.auth.verifyOTP(userId, dto.otp);
    return this.auth.finalizeLogin(userId);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordDto): Promise<void> {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Body(ValidationPipe) dto: ResetPasswordDto,
    @RealIP() userIP: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<void> {
    const { password, token, email } = dto;
    return this.auth.resetPassword(password, token, email, userIP, userAgent);
  }

  @Post('confirm-email')
  @HttpCode(200)
  confirmEmail(@Body(ValidationPipe) dto: ConfirmEmailDto) {
    const { email, code } = dto;
    return this.auth.confirmEmail(email, code);
  }

  @Post('resend-confirm-email')
  @HttpCode(200)
  public async resendConfirmEmail(
    @Body(ValidationPipe) dto: ResendConfirmEmailDto,
  ): Promise<void> {
    return await this.auth.resendConfirmEmail(dto.email);
  }

  // Controller that init the request to enable 2FA
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('enable2fa')
  enable2FA(@CurrentUser() user: User): Promise<IEnable2FAResponse> {
    return this.auth.enable2FA(user);
  }

  // Controller to verify the first time 2FA and activate 2FA for user
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('verify2fa')
  @UsePipes(new SanitizeTrimPipe())
  @HttpCode(200)
  verify2FA(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) dto: Verify2FADto,
  ): Promise<void> {
    return this.auth.verify2FA(userId, dto);
  }

  // Controller to disable 2FA
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('disable2fa')
  @UsePipes(new SanitizeTrimPipe())
  @HttpCode(200)
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) dto: VerifyOTPDto,
  ): Promise<void> {
    await this.auth.verifyOTP(userId, dto.otp);
    return this.auth.disable2FA(userId);
  }
}
