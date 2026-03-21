import { IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateVenueDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên cơ sở không được để trống' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    district?: string;

    @IsString()
    @IsOptional()
    ward?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link Facebook không hợp lệ' })
    fb_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link Instagram không hợp lệ' })
    instagram_url?: string;
}
