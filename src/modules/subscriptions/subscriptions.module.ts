import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';

@Module({
    imports: [],
    controllers: [],
    providers: [],
    exports: [],
})
export class SubscriptionsModule { }
