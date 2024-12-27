import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    @IsString()
    @IsOptional()
    title?: string;
  
    @IsString()
    @IsOptional()
    content?: string;
}
