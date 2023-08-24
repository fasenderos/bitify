import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyOTPDto {
  @IsString()
  @IsNotEmpty()
  readonly otp!: string;
}
