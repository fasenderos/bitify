import { Test, TestingModule } from '@nestjs/testing';
import { test, beforeEach } from 'tap';
import { AppController } from '../src/app.controller';
import { TerminusModule } from '@nestjs/terminus';

let appController: AppController;

beforeEach(async () => {
  const app: TestingModule = await Test.createTestingModule({
    imports: [TerminusModule],
    controllers: [AppController],
  }).compile();
  appController = app.get<AppController>(AppController);
});

test('/ping should return "pong"', ({ same, end }) => {
  same(appController.ping(), {});
  end();
});

test('/time should return serverTime', ({ equal, end }) => {
  equal(typeof appController.time().serverTime, 'number');
  end();
});
