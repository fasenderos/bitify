import { IsString, IsNotEmpty } from 'class-validator';

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  readonly otp!: string;

  @IsString()
  @IsNotEmpty()
  readonly secret!: string;
}
