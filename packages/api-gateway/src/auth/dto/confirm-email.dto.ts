import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';

export class ResendConfirmEmailDto {
  @ApiProperty({ description: 'User email', example: 'email@mysite.com' })
  @IsEmail()
  @IsNotEmptyString()
  readonly email!: string;
}

export class ConfirmEmailDto extends ResendConfirmEmailDto {
  @ApiProperty({ description: 'User code', example: '123456' })
  @IsNotEmptyString()
  readonly code!: number;
}
