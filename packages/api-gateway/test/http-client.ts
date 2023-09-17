import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createHmac } from 'crypto';

export class HttpClient {
  app: NestFastifyApplication;
  constructor(app: NestFastifyApplication) {
    this.app = app;
  }

  async get(path: string, auth?: string, headers?: any) {
    const response = await this.app.inject({
      method: 'GET',
      path,
      ...this.getHeaders(auth, headers),
    });
    return this.responseHandler(response);
  }

  async post(path: string, payload?: any, auth?: string, headers?: any) {
    const response = await this.app.inject({
      method: 'POST',
      path,
      ...this.getHeaders(auth, headers),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async put(path: string, payload?: any, auth?: string, headers?: any) {
    const response = await this.app.inject({
      method: 'PUT',
      path,
      ...this.getHeaders(auth, headers),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async patch(path: string, payload?: any, auth?: string, headers?: any) {
    const response = await this.app.inject({
      method: 'PATCH',
      path,
      ...this.getHeaders(auth, headers),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async del(path: string, auth?: string, headers?: any) {
    const response = await this.app.inject({
      method: 'DELETE',
      path,
      ...this.getHeaders(auth, headers),
    });
    return this.responseHandler(response);
  }

  async login(email: string, password: string, otp?: string, auth?: string) {
    const endpoint = otp ? 'otp' : 'login';
    const body = otp
      ? { code: otp }
      : {
          email,
          password,
          recaptchaToken: 'somerecaptchatoken',
        };
    return this.post(`/auth/${endpoint}`, body, auth);
  }

  getSignature(
    secretKey: string,
    publicKey: string,
    data: string,
    timestamp = Date.now(),
    recvWindow = 5000,
  ) {
    return createHmac('sha256', secretKey)
      .update(timestamp + publicKey + recvWindow + data)
      .digest('hex');
  }

  private getHeaders(auth?: string, headers?: any) {
    return auth
      ? {
          headers: {
            ...(headers ? headers : {}),
            authorization: `Bearer ${auth}`,
          },
        }
      : {
          ...(headers ? { headers } : {}),
        };
  }

  private responseHandler(response: any) {
    const { statusCode } = response;
    let body = response.body;
    try {
      body = JSON.parse(body);
    } catch (error) {}
    return {
      statusCode: statusCode,
      body,
    };
  }
}
