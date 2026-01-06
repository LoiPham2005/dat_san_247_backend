import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Setting)
        private settingRepository: Repository<Setting>,
    ) { }

    async findAll() {
        return this.settingRepository.find();
    }

    async upsert(data: any) {
        const { key, value, description } = data;
        let setting = await this.settingRepository.findOne({ where: { key } });
        if (setting) {
            setting.value = value;
            setting.description = description;
            return this.settingRepository.save(setting);
        } else {
            const newSetting = this.settingRepository.create(data);
            return this.settingRepository.save(newSetting);
        }
    }
}
