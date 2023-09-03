import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';
import { EmailDto } from '../../common/dto';

export class ResendConfirmEmailDto extends EmailDto {}

export class ConfirmEmailDto extends ResendConfirmEmailDto {
  @ApiProperty({ description: 'User code', example: '123456' })
  @IsNotEmptyString()
  readonly code!: string;
}
