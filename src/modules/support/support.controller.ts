// modules/support/support.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto, AddMessageDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TicketStatus } from './entities/support-ticket.entity';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  async createTicket(
    @CurrentUser('id') userId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(userId, createTicketDto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get my tickets' })
  async getMyTickets(@CurrentUser('id') userId: string) {
    return this.supportService.getUserTickets(userId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details' })
  async getTicket(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.getTicket(ticketId, userId);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Add message to ticket' })
  async addMessage(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
    @Body() addMessageDto: AddMessageDto,
  ) {
    return this.supportService.addMessage(ticketId, userId, addMessageDto);
  }

  @Patch('tickets/:id/close')
  @ApiOperation({ summary: 'Close ticket' })
  async closeTicket(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.supportService.closeTicket(ticketId, userId);
    return { message: 'Ticket closed' };
  }

  // Staff endpoints
  @Get('staff/tickets')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all tickets (Staff only)' })
  async getAllTickets(@Query('status') status?: TicketStatus) {
    return this.supportService.getAllTickets(status);
  }

  @Patch('staff/tickets/:id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Assign ticket (Staff only)' })
  async assignTicket(
    @Param('id') ticketId: string,
    @CurrentUser('id') staffId: string,
  ) {
    return this.supportService.assignTicket(ticketId, staffId);
  }

  @Patch('staff/tickets/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Resolve ticket (Staff only)' })
  async resolveTicket(
    @Param('id') ticketId: string,
    @Body() body: { resolutionNote: string },
  ) {
    return this.supportService.resolveTicket(ticketId, body.resolutionNote);
  }
}