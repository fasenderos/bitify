import Config from '../src/config';
import { AppConfig } from '../typings/common';
import t from 'tap';

t.test('test config', ({ same, end, equal }) => {
  // Without required params should throw err
  try {
    Config();
  } catch (err: any) {
    equal(err.message, 'Config missing env.RECAPTCHA_PRIVATE_KEY');
  }

  // Mock required params
  process.env['RECAPTCHA_PRIVATE_KEY'] = 'somevalue';
  process.env['EMAIL_FROM'] = 'somevalue';
  process.env['FRONTEND_BASE_URL'] = 'somevalue';

  const config: AppConfig = Config();
  same(config, {
    app: { name: '@bitify/api-gateway', version: '0.0.0' },
    auth: {
      exp2FAToken: '2m',
      expAccessToken: '15m',
      expRefreshToken: '7d',
      expVerifyMail: '8m',
      expResetPassword: '8m',
      recaptchaSecret: 'somevalue',
      secret2FAToken: 'CHANGE-2FA-TOKEN',
      secretAccessToken: 'CHANGE-ACCESS-TOKEN',
      secretRefreshToken: 'CHANGE-REFRESH-TOKEN',
    },
    db: {
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
    },
    email: { transport: undefined, from: 'somevalue' },
    encryption: { secret: 'CHANGE-ENCRYPTION-KEY' },
    frontend: { baseUrl: 'somevalue' },
    server: { address: '127.0.0.1', port: 3001 },
  });
  end();
});

// t.test(
//   'config should throw if missing required value default value',
//   ({ end, error }) => {
//     process.env['RECAPTCHA_PRIVATE_KEY'] = 'somevalue';
//     process.env['EMAIL_TRANSPORT'] = 'somevalue';
//     process.env['EMAIL_FROM'] = 'somevalue';

//     end();
//   },
// );
