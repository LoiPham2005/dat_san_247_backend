import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class SystemSettingsService {
    constructor(
        @InjectRepository(SystemSetting)
        private readonly settingRepo: Repository<SystemSetting>,
    ) { }

    async create(dto: CreateSystemSettingDto, userId: number) {
        const setting = this.settingRepo.create({
            ...dto,
            updatedBy: { id: userId } as any,
        });
        const saved = await this.settingRepo.save(setting);
        return success(saved, 'Tạo cài đặt hệ thống thành công');
    }

    async findAll() {
        const settings = await this.settingRepo.find({
            relations: ['updatedBy'],
            order: { createdAt: 'DESC' },
        });
        return success(settings, 'Lấy danh sách cài đặt hệ thống thành công');
    }

    async findOne(settingId: number) {
        const setting = await this.settingRepo.findOne({ where: { settingId } });
        if (!setting) throw new NotFoundException('Setting not found');
        return success(setting, 'Lấy chi tiết cài đặt thành công');
    }

    async findByKey(key: string) {
        const setting = await this.settingRepo.findOne({ where: { settingKey: key } });
        return success(setting, 'Lấy cài đặt theo key thành công');
    }

    async update(settingId: number, dto: UpdateSystemSettingDto, userId: number) {
        const setting = await this.settingRepo.findOne({ where: { settingId } });
        if (!setting) throw new NotFoundException('Setting not found');

        Object.assign(setting, dto, { updatedBy: { id: userId } as any });
        const updated = await this.settingRepo.save(setting);

        return success(updated, 'Cập nhật cài đặt thành công');
    }

    async remove(settingId: number) {
        const setting = await this.settingRepo.findOne({ where: { settingId } });
        if (!setting) throw new NotFoundException('Setting not found');

        const removed = await this.settingRepo.remove(setting);
        return success(removed, 'Xóa cài đặt thành công');
    }
}
