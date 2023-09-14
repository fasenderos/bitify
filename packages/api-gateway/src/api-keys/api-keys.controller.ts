import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Collections } from '../common/constants';
import { ControllerFactory } from '../base/base.controller';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

const BaseController = ControllerFactory<
  ApiKey,
  CreateApiKeyDto,
  UpdateApiKeyDto
>(CreateApiKeyDto, UpdateApiKeyDto, Collections.API_KEYS);

@ApiTags(Collections.API_KEYS)
@Controller(Collections.API_KEYS)
export class ApiKeysController extends BaseController {
  constructor(service: ApiKeysService) {
    super(service);
  }
}