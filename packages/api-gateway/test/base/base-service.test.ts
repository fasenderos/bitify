import { test } from 'tap';
import { buildServer, createUser } from '../helper';
import { UnprocessableEntityException } from '@nestjs/common';
import { RecoveryTokensService } from '../../src/recovery-tokens/recovery-tokens.service';
import { RecoveryToken } from '../../src/recovery-tokens/entities/recovery-token.entity';
import { randomUUID } from 'crypto';

// For testing the base service we use the recovery-token service
// which simply extend the base service without any modification
// TODO does make sense use a fake entity for that? in case
test('base service creatEntity() and save() method', async ({
  equal,
  teardown,
}) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };

  // Test createEntity() method with right params
  const tokenEntity = service.createEntity(mockBody, user.id);
  equal(tokenEntity instanceof RecoveryToken, true);

  // test save() method with right param
  const token = await service.save(tokenEntity);
  equal(token instanceof RecoveryToken, true);
});

test('base service find() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test find() method without params
  {
    const res = await service.find();
    equal(Array.isArray(res), true);
    res.forEach((token) => {
      equal(token instanceof RecoveryToken, true);
    });
  }

  // Test find() method with not valid filter
  {
    const res = await service.find({ where: { id: randomUUID() } });
    equal(Array.isArray(res), true);
    equal(res.length, 0);
  }

  // Test find() method with valid filter
  {
    const res = await service.find({ where: { id: token.id } });
    equal(Array.isArray(res), true);
    equal(res.length, 1);
  }
});

test('base service findOne() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test findOne() method invalid ID
  {
    const res = await service.findOne({ id: randomUUID() });
    equal(res, null);
  }

  // Test findOne() method with valid ID
  {
    const res = await service.findOne({ id: token.id });
    equal(res instanceof RecoveryToken, true);
    equal(res?.id, token.id);
  }
});

test('base service findById() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test findById() method invalid ID
  {
    const res = await service.findById(randomUUID());
    equal(res, null);
  }

  // Test findById() method with valid ID
  {
    const res = await service.findById(token.id);
    equal(res instanceof RecoveryToken, true);
    equal(res?.id, token.id);
  }
});

test('base service update() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test update() method with right params
  {
    await service.update({ id: token.id }, { token: 'newtokenUpdate' });
    const response = await service.findById(token.id);
    equal(response?.token, 'newtokenUpdate');
  }
  {
    // An update can not pass userId
    try {
      await service.update(
        { id: token.id },
        { token: 'newtokenWithUseId', userId: user.id },
      );
    } catch (error) {
      equal(error instanceof UnprocessableEntityException, true);
    }
  }
});

test('base service updateById() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test updatedById() method with right params
  {
    await service.updateById(token.id, {
      token: 'newtokenupdateById',
    });
    const response = await service.findById(token.id);
    equal(response?.token, 'newtokenupdateById');
  }
  // Test updatedById() method with right params and the userId
  {
    await service.updateById(
      token.id,
      {
        token: 'newtokenupdateByIdUserId',
      },
      user.id,
    );
    const response = await service.findById(token.id);
    equal(response?.token, 'newtokenupdateByIdUserId');
  }
  {
    // An updatedById can not pass userId
    try {
      await service.updateById(token.id, {
        token: 'newtokenWithUserId',
        userId: user.id,
      });
    } catch (error) {
      equal(error instanceof UnprocessableEntityException, true);
    }
  }
});

test('base service delete() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test delete() method with right params
  {
    await service.delete({ id: token.id });
    const response = await service.findById(token.id);
    equal(response, null);
    {
      // restore soft deleted token
      await service.repo.update({ id: token.id }, { deletedAt: null });
      // token should now exist
      const response = await service.findById(token.id);
      equal(response instanceof RecoveryToken, true);
    }
  }

  // Test delete() method with soft = false
  {
    await service.delete({ id: token.id }, false);
    const response = await service.findById(token.id);
    equal(response, null);
    {
      // try to restore deleted token
      await service.repo.update({ id: token.id }, { deletedAt: null });
      // token should not exist
      const response = await service.findById(token.id);
      equal(response, null);
    }
  }
});

test('base service deleteById() method', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const service = app.get(RecoveryTokensService);
  const { user } = await createUser(app);

  const mockBody = {
    token: 'somerecoverytoken',
    expiresAt: new Date(),
  };
  const tokenEntity = service.createEntity(mockBody, user.id);
  const token = await service.save(tokenEntity);

  // Test deleteById() method without passing userId
  {
    await service.deleteById(token.id);
    const response = await service.findById(token.id);
    equal(response, null);
    {
      // restore soft deleted token
      await service.repo.update({ id: token.id }, { deletedAt: null });
      // token should now exist
      const response = await service.findById(token.id);
      equal(response instanceof RecoveryToken, true);
    }
  }

  // Test deleteById() method with userId
  {
    await service.deleteById(token.id, user.id);
    const response = await service.findById(token.id);
    equal(response, null);
    {
      // restore soft deleted token
      await service.repo.update({ id: token.id }, { deletedAt: null });
      // token should now exist
      const response = await service.findById(token.id);
      equal(response instanceof RecoveryToken, true);
    }
  }

  // Test deleteById() method with soft = false
  {
    await service.deleteById(token.id, user.id, false);
    const response = await service.findById(token.id);
    equal(response, null);
    {
      // try to restore deleted token
      await service.repo.update({ id: token.id }, { deletedAt: null });
      // token should not exist
      const response = await service.findById(token.id);
      equal(response, null);
    }
  }
});
