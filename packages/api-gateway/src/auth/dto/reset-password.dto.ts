import { ApiProperty } from '@nestjs/swagger';
import { PasswordStrengthDto } from '../../common/dto';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';
import { IsEmail } from 'class-validator';

export class ResetPasswordDto extends PasswordStrengthDto {
  @ApiProperty({
    description: 'Recovery token provided for resetting password',
  })
  @IsNotEmptyString()
  readonly token!: string;

  @ApiProperty({ description: 'User email', example: 'email@mysite.com' })
  @IsEmail()
  @IsNotEmptyString()
  readonly email!: string;
}
