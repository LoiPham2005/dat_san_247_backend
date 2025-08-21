import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { User } from '../auth/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
    ) { }

    async create(createReportDto: CreateReportDto): Promise<Report> {
        const report = new Report();

        if (createReportDto.reporterId) {
            const reporter = await this.userRepository.findOne({
                where: { id: createReportDto.reporterId },
            });
            if (reporter) report.reporter = reporter;
        }

        if (createReportDto.reportedVenueId) {
            const venue = await this.venueRepository.findOne({
                where: { venueId: createReportDto.reportedVenueId },
            });
            if (venue) report.reportedVenue = venue;
        }

        if (createReportDto.reportedUserId) {
            const reportedUser = await this.userRepository.findOne({
                where: { id: createReportDto.reportedUserId },
            });
            if (reportedUser) report.reportedUser = reportedUser;
        }

        report.reportType = createReportDto.reportType;
        report.description = createReportDto.description;
        report.evidenceUrls = createReportDto.evidenceUrls ?? [];

        return this.reportRepository.save(report);
    }


    async findAll(): Promise<Report[]> {
        return this.reportRepository.find({
            relations: ['reporter', 'reportedVenue', 'reportedUser', 'resolvedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { reportId: id },
            relations: ['reporter', 'reportedVenue', 'reportedUser', 'resolvedBy'],
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        return report;
    }

    async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
        const report = await this.findOne(id);

        if (updateReportDto.status) report.status = updateReportDto.status;
        if (updateReportDto.priority) report.priority = updateReportDto.priority;
        if (updateReportDto.adminNotes) report.adminNotes = updateReportDto.adminNotes;

        if (updateReportDto.resolvedBy) {
            const resolver = await this.userRepository.findOne({
                where: { id: updateReportDto.resolvedBy },
            });
            if (resolver) report.resolvedBy = resolver;
            report.resolvedAt = new Date();
        }

        return this.reportRepository.save(report);
    }

    async delete(id: number): Promise<void> {
        const result = await this.reportRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }
    }
}
