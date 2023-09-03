import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';
import { OTPDto } from '../../common/dto';

export class Verify2FADto extends OTPDto {
  @ApiProperty({
    description: 'OTP secret provided after enabling 2FA',
  })
  @IsNotEmptyString()
  readonly secret!: string;
}
