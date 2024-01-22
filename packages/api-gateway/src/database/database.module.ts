import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../../database/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
})
export class DBModule {}
