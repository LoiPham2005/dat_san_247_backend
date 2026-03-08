import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
    @IsOptional()
    @IsBoolean()
    notif_push?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_email?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_sms?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_booking?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_promotion?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_payment?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_system?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_staff?: boolean;
}
