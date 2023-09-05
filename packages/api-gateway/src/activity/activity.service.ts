import { Injectable } from '@nestjs/common';
import { Activity } from './activity.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityRecord, ActivityRecordDto } from '../events';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  @OnEvent(ActivityRecord)
  async activityRecord({
    userId,
    userIP,
    userAgent,
    action,
    result,
    topic,
    data,
  }: ActivityRecordDto) {
    console.log('INSER ACTIVITIES');
    await this.repo.insert({
      userId,
      userIP,
      userAgent,
      action,
      result,
      topic,
      ...(data ? { data } : {}),
    });
  }
}
