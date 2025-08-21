import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerRequestDto } from './create-partner-request.dto';

export class UpdatePartnerRequestDto extends PartialType(CreatePartnerRequestDto) {}
