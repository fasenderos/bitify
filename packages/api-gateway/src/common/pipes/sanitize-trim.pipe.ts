import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { trim } from '../utils';

@Injectable()
export class SanitizeTrimPipe implements PipeTransform {
  transform(values: any, metadata: ArgumentMetadata) {
    const { type } = metadata;
    if (type === 'body') {
      return trim(values, 'password');
    }
    return values;
  }
}
