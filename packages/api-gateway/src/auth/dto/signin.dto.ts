import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
