import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyReviewDto {
    @IsString()
    @IsNotEmpty()
    reply_comment: string;
}
