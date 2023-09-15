import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseTransaction } from '../../base/base.transaction';
import { RecoveryToken } from '../../recovery-tokens/entities/recovery-token.entity';
import { hash } from 'bcrypt';
import { User } from '../../users/entities/user.entity';

interface ResetPasswordTransactionInput {
  userId: string;
  password: string;
  hashedToken: string;
}

@Injectable()
export class ResetPasswordTransaction extends BaseTransaction<
  ResetPasswordTransactionInput,
  void
> {
  constructor(connection: DataSource) {
    super(connection);
  }

  // Run reset password in transaction to prevent race conditions.
  protected async execute(
    data: ResetPasswordTransactionInput,
    manager: EntityManager,
  ): Promise<any> {
    const { userId, password, hashedToken } = data;
    // Get all user recovery tokens from DB
    const allUsertokens = await manager.find(RecoveryToken, {
      where: { userId },
    });
    const token = allUsertokens.find((x) => x.token === hashedToken);
    if (!token)
      // The token was redeemed by another transaction
      throw new UnprocessableEntityException('Invalid password reset token');

    // Delete all tokens belonging to this user to prevent duplicate use
    await manager.delete(RecoveryToken, { userId });
    // Check if the current token has expired or not
    if (token.expiresAt.getTime() < Date.now())
      throw new UnprocessableEntityException(
        'Your password reset oken has expired. Please try again',
      );

    // All checks have been completed. We can change the user’s password
    const passwordHash = await hash(password, 10);
    await manager.update(User, { id: userId }, { passwordHash });
  }
}
