import { PickType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './create-api-key.dto';

export class UpdateApiKeyDto extends PickType(CreateApiKeyDto, [
  'spot',
  'userIps',
  'wallet',
] as const) {}
