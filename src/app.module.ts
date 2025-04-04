import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
