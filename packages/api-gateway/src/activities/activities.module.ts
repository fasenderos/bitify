import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
