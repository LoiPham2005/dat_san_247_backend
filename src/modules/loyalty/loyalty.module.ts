import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPoint } from './entities/user-point.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserPoint, PointTransaction]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class LoyaltyModule { }
