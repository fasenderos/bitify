import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';

export class VerifyOTPDto {
  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmptyString()
  readonly otp!: string;
}
