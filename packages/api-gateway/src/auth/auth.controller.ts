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
import { AuthService, ISignInResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/user.entity';
import { Verify2FADto } from './dto/verify-2fa.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  signUp(@Body(ValidationPipe) dto: RegisterDto): Promise<void> {
    const { email, password } = dto;
    return this.auth.signUp(email, password);
  }

  @Post('login')
  signIn(@Body(ValidationPipe) dto: LoginDto): Promise<ISignInResponse> {
    const { email, password } = dto;
    return this.auth.signIn(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Headers('Authorization') auth: string): Promise<void> {
    return this.auth.logout(auth);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  refreshToken(
    @Headers('Authorization') auth: string,
  ): Promise<ISignInResponse> {
    return this.auth.refreshToken(auth);
  }

  // Controller that init the request to enable 2FA
  @UseGuards(JwtAuthGuard)
  @Post('enable2fa')
  enable2FA(@GetUser() user: User): any {
    return this.auth.enable2FA(user);
  }

  // Controller to verify the first time 2FA and activate 2FA for user
  @UseGuards(JwtAuthGuard)
  @Post('verify2fa')
  verify2FA(
    @GetUser('id') userId: string,
    @Body(ValidationPipe) dto: Verify2FADto,
  ): Promise<void> {
    return this.auth.verify2FA(userId, dto);
  }
}
