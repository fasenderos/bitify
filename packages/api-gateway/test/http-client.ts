import { NestFastifyApplication } from '@nestjs/platform-fastify';

export class HttpClient {
  app: NestFastifyApplication;
  constructor(app: NestFastifyApplication) {
    this.app = app;
  }

  async get(path: string, auth?: string) {
    const response = await this.app.inject({
      method: 'GET',
      path,
      ...this.getAuth(auth),
    });
    return this.responseHandler(response);
  }

  async post(path: string, payload?: any, auth?: string) {
    const response = await this.app.inject({
      method: 'POST',
      path,
      ...this.getAuth(auth),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async put(path: string, payload?: any, auth?: string) {
    const response = await this.app.inject({
      method: 'PUT',
      path,
      ...this.getAuth(auth),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async patch(path: string, payload?: any, auth?: string) {
    const response = await this.app.inject({
      method: 'PATCH',
      path,
      ...this.getAuth(auth),
      ...(payload ? { payload } : {}),
    });
    return this.responseHandler(response);
  }

  async del(path: string, auth?: string) {
    const response = await this.app.inject({
      method: 'DELETE',
      path,
      ...this.getAuth(auth),
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
        };
    return this.post(`/auth/${endpoint}`, body, auth);
  }

  private getAuth(auth?: string) {
    return auth ? { headers: { authorization: `Bearer ${auth}` } } : {};
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
