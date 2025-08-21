import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerResponseDto } from './create-partner-response.dto';

export class UpdatePartnerResponseDto extends PartialType(CreatePartnerResponseDto) {}
