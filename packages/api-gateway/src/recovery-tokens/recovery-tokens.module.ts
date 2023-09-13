import { Module } from '@nestjs/common';
import { RecoveryTokensService } from './recovery-tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryToken } from './entities/recovery-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecoveryToken])],
  providers: [RecoveryTokensService],
  exports: [RecoveryTokensService],
})
export class RecoveryTokensModule {}
