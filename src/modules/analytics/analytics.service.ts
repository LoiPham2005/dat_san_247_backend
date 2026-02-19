import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '../../common/constants/activity-type.constant';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
    ) { }


}
