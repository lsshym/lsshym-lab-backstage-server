import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Articles, ArticlesSchema } from './schemas/articles.schema';

@Module({
  imports: [
    // 将 BlogSchema 注册到 Mongoose
    MongooseModule.forFeature([{ name: Articles.name, schema: ArticlesSchema }]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
