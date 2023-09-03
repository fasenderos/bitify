import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../decorators/is-not-empty-string.decorator';

export class EmailDto {
  @ApiProperty({ description: 'User email', example: 'email@mysite.com' })
  @IsEmail()
  @IsNotEmptyString()
  readonly email!: string;
}

export class OTPDto {
  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmptyString()
  readonly otp!: string;
}

const passwordDescription =
  'Password has to be between 8-30 characters, and contains at least one uppercase letter, one lowercase letter and a number';

export class PasswordStrengthDto {
  @ApiProperty({
    description: `User ${passwordDescription}`,
    example: 'mR3U5c91Xs',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 0,
    },
    {
      message: passwordDescription,
    },
  )
  @MaxLength(30, {
    message: passwordDescription,
  })
  @IsNotEmptyString()
  readonly password!: string;
}
