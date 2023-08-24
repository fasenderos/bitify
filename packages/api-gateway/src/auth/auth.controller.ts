import { Controller, Body, ValidationPipe, Post } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { RealIP } from 'nestjs-real-ip';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('sign-up')
  async signUp(@Body(ValidationPipe) dto: SignUpDto): Promise<void> {
    const { email, password } = dto;
    return await this.auth.signUp(email, password);
  }

  @Post('sign-in')
  async signIn(
    @RealIP() userIp: string,
    @Body(ValidationPipe) dto: SignInDto,
  ): Promise<any> {
    const { email, password } = dto;
    return await this.auth.signIn(email, password, userIp);
  }
}
