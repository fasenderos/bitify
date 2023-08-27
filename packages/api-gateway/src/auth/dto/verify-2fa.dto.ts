import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';

export class Verify2FADto {
  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmptyString()
  readonly otp!: string;

  @ApiProperty({
    description: 'OTP secret provided after enabling 2FA',
  })
  @IsNotEmptyString()
  readonly secret!: string;
}
