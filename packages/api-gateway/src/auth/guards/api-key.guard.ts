import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { CipherService } from '../../common/modules/cipher/cipher.service';
import { createHmac } from 'crypto';

enum ApiKeyHeaders {
  X_BTF_SIGN = 'x-btf-sign',
  X_BTF_API_KEY = 'x-btf-api-key',
  X_BTF_TIMESTAMP = 'x-btf-timestamp',
  X_BTF_RECV_WINDOW = 'x-btf-recv-window',
}

const { X_BTF_SIGN, X_BTF_API_KEY, X_BTF_TIMESTAMP, X_BTF_RECV_WINDOW } =
  ApiKeyHeaders;

interface IApiKeyHeaders {
  [X_BTF_SIGN]: string;
  [X_BTF_API_KEY]: string;
  [X_BTF_TIMESTAMP]: number;
  [X_BTF_RECV_WINDOW]: number;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apikey: ApiKeysService,
    private readonly cipher: CipherService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<FastifyRequest>();
      const headers = this.extractHeadersFromRequest(request);
      // The timestamp headers must adheres to the following rule
      // serverTime - recvWindow <= timestamp < serverTime + 1000
      const now = Date.now();
      const timestamp = headers[X_BTF_TIMESTAMP];
      const recvWindow = headers[X_BTF_RECV_WINDOW];

      // Check that the timestamp is in the current recvWindow
      if (!(now - recvWindow <= timestamp && timestamp < now + 1000))
        throw new UnprocessableEntityException(
          'Timestamp for the request is outside of the recvWindow',
        );

      const publicKey = headers[X_BTF_API_KEY];
      const apikey = await this.apikey.findOne(
        {
          public: publicKey,
        },
        true,
      );
      if (!apikey) throw new UnauthorizedException();

      // Check if api key is expired
      const expiresAt = new Date(apikey.expiresAt).getTime();
      if (expiresAt > 0 && expiresAt < now)
        throw new UnprocessableEntityException('Your api key is expired');

      // Now we have to check the HMAC signature
      const signature = headers[X_BTF_SIGN];
      const secretKey = this.cipher.decrypt(apikey.secret);
      const data = this.extractDataFromRequest(request);
      const verifySign = createHmac('sha256', secretKey)
        .update(timestamp + publicKey + recvWindow + data)
        .digest('hex');
      if (signature !== verifySign)
        throw new UnauthorizedException('HMAC Verification failed');

      return true;
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new BadRequestException();
    }
  }

  private extractDataFromRequest(request: FastifyRequest): string {
    let data: string = '';
    if (request.method === 'POST' && request.body) {
      data = JSON.stringify(request.body);
    } else if (request.method === 'GET' && request.query) {
      data = this.serializeParams(request.query);
    } else {
      throw new UnprocessableEntityException(
        'Valid method for api-key are POST and GET',
      );
    }
    return data;
  }

  private extractHeadersFromRequest(request: FastifyRequest): IApiKeyHeaders {
    if (
      !request?.headers?.[X_BTF_SIGN] ||
      !request?.headers?.[X_BTF_API_KEY] ||
      !request?.headers?.[X_BTF_TIMESTAMP]
    )
      throw new UnauthorizedException('Missing api key headers');

    const headers: IApiKeyHeaders = {
      [X_BTF_SIGN]: request.headers[X_BTF_SIGN] as string,
      [X_BTF_API_KEY]: request.headers[X_BTF_API_KEY] as string,
      [X_BTF_TIMESTAMP]: parseInt(request.headers[X_BTF_TIMESTAMP] as string),
      [X_BTF_RECV_WINDOW]: request.headers[X_BTF_RECV_WINDOW]
        ? parseInt(request.headers[X_BTF_RECV_WINDOW] as string)
        : 5000,
    };
    return headers;
  }

  private serializeParams(params: any = {}): string {
    const properties = Object.keys(params);
    return properties
      .map((key) => {
        // Every param value must be encoded
        const value = encodeURIComponent(params[key]);
        // Strict validation, if there are empty params throw error
        if (value?.length === 0) {
          throw new UnprocessableEntityException(
            'Failed to sign API request due to undefined parameter',
          );
        }
        return `${key}=${value}`;
      })
      .join('&');
  }
}
