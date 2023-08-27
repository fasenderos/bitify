import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'email@mysite.com' })
  @IsEmail()
  @IsNotEmptyString()
  readonly email!: string;

  @ApiProperty({ description: 'User password', example: 'mR3U5c91Xs' })
  @IsNotEmptyString()
  readonly password!: string;
}
