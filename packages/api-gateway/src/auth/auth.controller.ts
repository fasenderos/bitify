import {
  Controller,
  Body,
  ValidationPipe,
  Post,
  Headers,
  Get,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService, I2FAResponse, ILoginResponse } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/user.entity';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Jwt2FAGuard } from './guards/jwt-2fa.guard';
import { VerifyOTPDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  signUp(@Body(ValidationPipe) dto: RegisterDto): Promise<void> {
    const { email, password } = dto;
    return this.auth.register(email, password);
  }

  @Post('login')
  signIn(
    @Body(ValidationPipe) dto: LoginDto,
  ): Promise<ILoginResponse | I2FAResponse> {
    const { email, password } = dto;
    return this.auth.login(email, password);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@Headers('Authorization') auth: string): Promise<void> {
    return this.auth.logout(auth);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  refreshToken(
    @Headers('Authorization') auth: string,
  ): Promise<ILoginResponse> {
    return this.auth.refreshToken(auth);
  }

  // Controller to verify OTP every time and return the real access token
  @UseGuards(Jwt2FAGuard)
  @Post('otp')
  async verifyOTP(
    @GetUser('id') userId: string,
    @Body(ValidationPipe) dto: VerifyOTPDto,
  ): Promise<ILoginResponse> {
    await this.auth.verifyOTP(userId, dto.otp);
    return this.auth.finalizeLogin(userId);
  }

  // Controller that init the request to enable 2FA
  @UseGuards(JwtGuard)
  @Post('enable2fa')
  enable2FA(@GetUser() user: User): any {
    return this.auth.enable2FA(user);
  }

  // Controller to verify the first time 2FA and activate 2FA for user
  @UseGuards(JwtGuard)
  @Post('verify2fa')
  verify2FA(
    @GetUser('id') userId: string,
    @Body(ValidationPipe) dto: Verify2FADto,
  ): Promise<void> {
    return this.auth.verify2FA(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Post('disable2fa')
  async disable2FA(
    @GetUser('id') userId: string,
    @Body(ValidationPipe) dto: VerifyOTPDto,
  ): Promise<void> {
    await this.auth.verifyOTP(userId, dto.otp);
    return this.auth.disable2FA(userId);
  }
}
