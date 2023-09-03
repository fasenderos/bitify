import { Module } from '@nestjs/common';
import { RecoveryTokenService } from './recovery-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryToken } from './recovery-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecoveryToken])],
  providers: [RecoveryTokenService],
  exports: [RecoveryTokenService],
})
export class RecoveryTokenModule {}
