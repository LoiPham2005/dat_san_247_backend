import { Controller, Get } from '@nestjs/common';
import { LookupService } from './lookup.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public/lookup')
export class PublicLookupController {
    constructor(private readonly lookupService: LookupService) {}

    @Public()
    @Get('sport-types')
    async getSportTypes() {
        const sportTypes = await this.lookupService.getSportTypes();
        return ResponseUtil.success(sportTypes, 'Sport types retrieved successfully');
    }
}
