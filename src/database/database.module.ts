import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // 导入 ConfigModule
      inject: [ConfigService], // 注入 ConfigService
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('DATABASE_HOST')}:${configService.get<number>('DATABASE_PORT')}/${configService.get<string>('DATABASE_NAME')}`,
        // user: configService.get<string>('DATABASE_USERNAME'),
        // pass: configService.get<string>('DATABASE_PASSWORD'),
        // 可选配置
        // authSource: 'admin', // 如果需要认证数据库
      }),
    }),
  ],
})
export class DatabaseModule {}
