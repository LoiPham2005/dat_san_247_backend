// src/modules/complaints/complaint.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, User])],
  controllers: [ComplaintController],
  providers: [ComplaintService],
})
export class ComplaintModule {}
