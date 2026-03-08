import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PermissionDto {
    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsNotEmpty()
    @IsString()
    resource: string;

    @IsNotEmpty()
    @IsString()
    action: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    scope?: string; // 'platform'|'venue'
}

export class SyncPermissionsDto {
    @IsNotEmpty()
    @IsArray()
    permissions: PermissionDto[];
}

export class UpdateRolePermissionsDto {
    @IsNotEmpty()
    @IsArray()
    permissionIds: string[];
}
