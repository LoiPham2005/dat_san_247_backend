import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TurnstileService } from './turnstile.service';

@Global()
@Module({
    imports: [HttpModule],
    providers: [TurnstileService],
    exports: [TurnstileService],
})
export class TurnstileModule { }
