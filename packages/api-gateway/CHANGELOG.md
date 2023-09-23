# Changelog

## 0.1.0 (2023-09-23)

### Features

- ad api keys ([d747397](https://github.com/fasenderos/bitify/commit/d74739716e1c411115e3743548d75085893eadab))
- add base controller ([3e53f05](https://github.com/fasenderos/bitify/commit/3e53f05c90ee97f9eb9af8bacd91122d191a5dd1))
- add decorator for checkin non empty string ([c5af484](https://github.com/fasenderos/bitify/commit/c5af4849317ee7923e7afcb8bb234196d07a557f))
- add endpoint for otp and disable 2fa ([60d0871](https://github.com/fasenderos/bitify/commit/60d0871403c87f05e3e7cf1c75dd942c63833232))
- add jwt auth guard + logout endpoint ([646df2b](https://github.com/fasenderos/bitify/commit/646df2b6d1084607ca514e03b66b5fd596fe9a39))
- add more base method and some comments ([9f8946f](https://github.com/fasenderos/bitify/commit/9f8946fbcb7569cb5b1cf452f44a1ae37bac9845))
- add reCAPTCHA ([2931e13](https://github.com/fasenderos/bitify/commit/2931e13866ba2b561578666132e210ac8b7888c4))
- add refresh token ([51332f6](https://github.com/fasenderos/bitify/commit/51332f69f8f54749a4f943794bf0aa7c8b798c6a))
- add reset password ([bc8f767](https://github.com/fasenderos/bitify/commit/bc8f767eed48ea7c49cbe56ea3f47531f88f4a18))
- add sanitize pipe to base controller ([6cc899f](https://github.com/fasenderos/bitify/commit/6cc899f0882f939f978ba3439cd74072b33ab738))
- add user profile ([e87b8af](https://github.com/fasenderos/bitify/commit/e87b8afaea5ce2b77d63fab029178bffdb966778))
- api key HMAC guard + test ([2b4bed2](https://github.com/fasenderos/bitify/commit/2b4bed20b0c85fa07aab14b7825dfbaf9cdb6671))
- cipher module to encrypt/decrypt things ([fa64a5f](https://github.com/fasenderos/bitify/commit/fa64a5f1b36943fdfc4686564312473e5ad1d1d5))
- email confirmation + otp backup codes ([38e730b](https://github.com/fasenderos/bitify/commit/38e730b9a09b57788548e669b9ceb38cb2d3adcf))
- enpoints to enable and verify 2FA ([808a62b](https://github.com/fasenderos/bitify/commit/808a62b3e1151f73dd8c7d7a3abdd4f4412dc86c))
- improve auth user verification on login ([54cde5b](https://github.com/fasenderos/bitify/commit/54cde5b7cea1c1d1379fea71a81de2114db55a8f))
- improve base service and add test ([f8c3228](https://github.com/fasenderos/bitify/commit/f8c3228c563630c44064705b21292838b731645f))
- init activity tracker ([7e5d0af](https://github.com/fasenderos/bitify/commit/7e5d0af606de08d30df02f5bab7665f199197b10))
- init base RBAC ([e492e86](https://github.com/fasenderos/bitify/commit/e492e869f3eca1d36aef26bae91c6d8aa0fb5e6f))
- new GetUser decoretor to extract user from request ([47384ca](https://github.com/fasenderos/bitify/commit/47384cae82a054ea8d6290882d8e2546dd9343da))
- new pipe to trim body ([ada1308](https://github.com/fasenderos/bitify/commit/ada13084137e0d2bf74c20eac3d77853b9699a4b))
- re-send confirm email ([756cbee](https://github.com/fasenderos/bitify/commit/756cbee0053557069c008ef2f26704d51a68557b))

### Bug Fixes

- ensure encryption key is 32 chars length ([af3a086](https://github.com/fasenderos/bitify/commit/af3a0864435411763d7203b2f87d7b711e5c8f93))
- recory token logic and test ([59be82d](https://github.com/fasenderos/bitify/commit/59be82d4da68abe9fca04b6be6172f5853c09e97))
- remove backup otp codes ([aad0f24](https://github.com/fasenderos/bitify/commit/aad0f246597a4273f587173ac6e9b744be257647))
- response logger and add re captcha test ([e0022a9](https://github.com/fasenderos/bitify/commit/e0022a9c4f17693c6218a844e20927a8e4d89b7b))

### Chore

- add notes and HMAC type on apikey ([ac56fb9](https://github.com/fasenderos/bitify/commit/ac56fb9619d7c664060c60fba356eee1e4e8157c))
- add release action + auto changelog ([aa6a17b](https://github.com/fasenderos/bitify/commit/aa6a17b98a66173f917f972651d024d68decf87c))
- add userId to base entity ([10015a4](https://github.com/fasenderos/bitify/commit/10015a4a4839d6b0e575d4b6f2a8c1a14522d34e))
- config eslint and prettier ([60faba1](https://github.com/fasenderos/bitify/commit/60faba1164948f3c73f31a814e58a77d4bd4c826))
- remove changest ([1a3bfab](https://github.com/fasenderos/bitify/commit/1a3bfab2eaedabb3a2ecbebde5aaeb31c4c45767))
- script for coping license across the monorepo ([438ede0](https://github.com/fasenderos/bitify/commit/438ede09d132685f5a411e0a81dba6e5386a37a3))
- split lint and lint:fix command ([64dad18](https://github.com/fasenderos/bitify/commit/64dad18216ed59c65290aef0193f4d1d10407869))

### Documentation

- add licenses ([5b6b837](https://github.com/fasenderos/bitify/commit/5b6b837cec3df6bea6558c830753a6df0836411d))
- **api-gateway:** add changelog ([6ac569d](https://github.com/fasenderos/bitify/commit/6ac569dbb6e15f1deb5b5617416a32d4e44f21ed))
- **api-gateway:** init empty changelog ([1ddea49](https://github.com/fasenderos/bitify/commit/1ddea49ebb2096de5517c65978082d8bb8e25380))
- **api-gateway:** remove changelog ([d7ba8ec](https://github.com/fasenderos/bitify/commit/d7ba8ec64cb8b4883b774956a98711696d57e3e0))
- init api documentation with swagger ([db08987](https://github.com/fasenderos/bitify/commit/db08987dce3f874bd7a90f06c2f2ddca5ec30598))
- update readme ([17b57ae](https://github.com/fasenderos/bitify/commit/17b57ae7a9876423f290fb14920eb2a631fc3a80))

### Refactoring

- rename signup/in to register/login to avoid confusion ([77ad14f](https://github.com/fasenderos/bitify/commit/77ad14ff7ee67deac4bc6701139c80fde298bbaa))
- replace custom cipher with cryptr ([4f029a2](https://github.com/fasenderos/bitify/commit/4f029a24b48139623765d7de37800523a8d07004))

### Performance Improvement

- add index on userId on every entity ([40af058](https://github.com/fasenderos/bitify/commit/40af058db549f633bd3efb46aa31c185235b7dd5))

### Test

- add api keys test ([2861c10](https://github.com/fasenderos/bitify/commit/2861c1048ac054e45581956f10de70c8e0980b56))
- add auth test ([06c677f](https://github.com/fasenderos/bitify/commit/06c677f0df32424f22683f74c2028517ec119cf5))
- add codecov integration ([3a55e31](https://github.com/fasenderos/bitify/commit/3a55e316b126a1038957a9167fa39efceb5c9ec9))
- add coverage report to PR ([b009d4a](https://github.com/fasenderos/bitify/commit/b009d4a615aac70f209e03442165300bd8fdbdcf))
- add missing email from env to cicd ([d0d2f03](https://github.com/fasenderos/bitify/commit/d0d2f032fda8fbed3086c6c362d4306d76b13013))
- add trim test ([9d6d8f1](https://github.com/fasenderos/bitify/commit/9d6d8f11752001cfbfda0d53bf1cf3785084fa8f))
- apikey find, update and delete ([7e5bc07](https://github.com/fasenderos/bitify/commit/7e5bc07e7e14433ab8735382dfcd4c291fa6d5b6))
- change coverage format to lcov ([23b929d](https://github.com/fasenderos/bitify/commit/23b929d77982be8981999cc9e0e689428e9b6b2b))
- clear DB on every test ([be24eda](https://github.com/fasenderos/bitify/commit/be24eda4bbe74f2271fdc99c9f10aa1b28999b0b))
- fix before-all-tests.js for cicd ([252306d](https://github.com/fasenderos/bitify/commit/252306d47ecbb2f0ecf38c4e00e9e44ba9bb6ce7))
- fix config test ([2408979](https://github.com/fasenderos/bitify/commit/240897939fa25a7601c032eade238809470a76be))
- run tap on node 20 ([eeb802a](https://github.com/fasenderos/bitify/commit/eeb802aa3f11e105e4a25597efe646f49073f31e))
- test login for user banned/pending ([a5b571e](https://github.com/fasenderos/bitify/commit/a5b571e41c2251ebe750637579a978bfc02ea056))
- try to fix codecov coverage ([fc7ebf3](https://github.com/fasenderos/bitify/commit/fc7ebf3bf1a4462ee9e1a25001d62ebb3c39cf12))
