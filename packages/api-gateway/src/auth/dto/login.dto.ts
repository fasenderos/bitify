import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';
import { EmailDto } from '../../common/dto';

export class LoginDto extends EmailDto {
  @ApiProperty({ description: 'User password', example: 'mR3U5c91Xs' })
  @IsNotEmptyString()
  readonly password!: string;
}
