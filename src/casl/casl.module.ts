import { Module } from '@nestjs/common';
import { AbilityFactory } from './abilities/ability.factory';

@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory], // Export để các module khác có thể sử dụng
})
export class CaslModule {}