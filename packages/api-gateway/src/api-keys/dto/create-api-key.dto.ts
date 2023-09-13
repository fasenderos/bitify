import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIP, IsOptional, ValidateIf } from 'class-validator';
import { ApiKeyAbility } from '../../app.roles';

export class CreateApiKeyDto {
  @ApiPropertyOptional({ description: 'List of trusted IPs' })
  @IsArray()
  @IsIP(undefined, { each: true })
  @IsOptional()
  readonly userIps?: string[];

  @ApiPropertyOptional({
    enum: ApiKeyAbility,
    description: 'Read: list spot orders; Write: submit and cancel spot orders',
    example: [ApiKeyAbility.READ, ApiKeyAbility.READ_WRITE],
  })
  @IsEnum(ApiKeyAbility)
  @ValidateIf((o) => !o.wallet || o.spot)
  readonly spot?: ApiKeyAbility;

  @ApiPropertyOptional({
    enum: ApiKeyAbility,
    description:
      'Read: wallet status, deposit and withdraw history; Write: submit withdraw requests',
    example: [ApiKeyAbility.READ, ApiKeyAbility.READ_WRITE],
  })
  @IsEnum(ApiKeyAbility)
  @ValidateIf((o) => !o.spot || o.wallet)
  readonly wallet?: ApiKeyAbility;
}
