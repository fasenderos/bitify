import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
