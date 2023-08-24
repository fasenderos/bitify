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
}
