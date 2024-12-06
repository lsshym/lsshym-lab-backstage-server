import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    // 只允许DTO中定义的属性，其余自动过滤，防止不必要数据通过
    forbidNonWhitelisted: true, 
    // 如果请求包含DTO未定义的属性，则抛出异常，而不是忽略
    transform: true, 
    // 自动将请求中的字符串等数据转化为DTO定义的类型（如string转number）
  }));
  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('API 文档') // API 文档的标题
    .setDescription('NestJS API 文档说明') // API 文档的描述
    .setVersion('1.0') // API 的版本
    .addTag('cats') // 可选，定义API的tag，用于分类
    .build();

  // 创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, config);
  // 设置 Swagger UI 的路径
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
