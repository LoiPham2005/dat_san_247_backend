import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/constants/role.constant';
import { AuditService } from '../audit.service';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private auditService: AuditService) {}

    @Get('logs')
    getAllLogs(@Query('limit') limit: string) {
        return this.auditService.getAllLogs(limit ? parseInt(limit) : 100);
    }
}
