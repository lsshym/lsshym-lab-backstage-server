// scripts/seed-admin.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/auth/admin.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const adminService = app.get(AdminService);
  const configService = app.get(ConfigService);

  const username = configService.get<string>('INIT_ADMIN_USERNAME');
  const plainPassword = configService.get<string>('INIT_ADMIN_PASSWORD');

  if (!username || !plainPassword) {
    console.error('请在 .env 文件中设置 INIT_ADMIN_USERNAME 和 INIT_ADMIN_PASSWORD');
    process.exit(1);
  }

  const existingAdmin = await adminService.findOne(username);
  if (existingAdmin) {
    console.log(`管理员用户 "${username}" 已存在，跳过创建。`);
  } else {
    await adminService.create({
      username,
      password: plainPassword,
    });
    console.log(`管理员用户 "${username}" 创建成功。`);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('管理员创建失败:', err);
  process.exit(1);
});
