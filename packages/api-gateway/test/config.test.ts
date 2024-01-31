import Config from '../src/config';
import { name, version } from '../package.json';
import t from 'tap';
import { AppConfig } from '../src/common/interfaces';
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + './../.env.template' });

t.test('test config', ({ same, end, equal }) => {
  // Without required params should throw err
  try {
    Config();
  } catch (err: any) {
    equal(err.message, 'Config missing env.RECAPTCHA_PRIVATE_KEY');
  }

  const config: AppConfig = Config();
  same(config, {
    app: { name, version },
    auth: {
      exp2FAToken: '2m',
      expAccessToken: '15m',
      expRefreshToken: '7d',
      expVerifyMail: '8m',
      expResetPassword: '8m',
      recaptchaSecret: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      secret2FAToken: 'change-me-jwt-2fa-secret',
      secretAccessToken: 'change-me-jwt-secret',
      secretRefreshToken: 'change-me-jwt-refresh-secret',
    },
    db: {
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'mysecretpassword',
      database: 'my_database',
    },
    email: {
      transport: 'smtps://username:password@smtp.example.com',
      from: 'no-reply <email@somesite.com>',
    },
    encryption: { secret: 'change-me-encryption-secret-32-c' },
    frontend: { baseUrl: 'http://127.0.0.1:3000' },
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
