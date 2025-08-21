import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
  ) {}

  async create(dto: CreateSystemSettingDto, userId: number) {
    const setting = this.settingRepo.create({
      ...dto,
      updatedBy: { id: userId } as any,
    });
    return await this.settingRepo.save(setting);
  }

  async findAll() {
    return await this.settingRepo.find({
      relations: ['updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(settingId: number) {
    const setting = await this.settingRepo.findOne({ where: { settingId } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async findByKey(key: string) {
    return await this.settingRepo.findOne({ where: { settingKey: key } });
  }

  async update(settingId: number, dto: UpdateSystemSettingDto, userId: number) {
    const setting = await this.findOne(settingId);
    Object.assign(setting, dto, { updatedBy: { id: userId } as any });
    return await this.settingRepo.save(setting);
  }

  async remove(settingId: number) {
    const setting = await this.findOne(settingId);
    return await this.settingRepo.remove(setting);
  }
}
