import { Module } from '@nestjs/common'; // 用于定义Nest模块的装饰器
import { MongooseModule } from '@nestjs/mongoose'; // 与MongoDB集成
import { Admin, AdminSchema } from './schemas/admin.schema'; 
// 导入Admin类和AdminSchema，用于描述管理员数据结构和数据库模式
import { AdminService } from './admin.service'; // 管理员数据操作服务，如创建、查询管理员
import { AuthService } from './auth.service'; // 认证服务，如验证密码、生成JWT
import { AuthController } from './auth.controller'; // 认证控制器，处理HTTP请求（注册、登录、获取资料）
import { PassportModule } from '@nestjs/passport'; 
// Passport集成模块，用于实现策略（strategy）进行认证
import { JwtModule } from '@nestjs/jwt'; // 用于生成和验证JWT令牌的模块
import { LocalStrategy } from './local.strategy'; // 本地策略，用于基于用户名和密码认证
import { JwtStrategy } from './jwt.strategy'; // JWT策略，用于基于JWT令牌认证
import { ConfigModule, ConfigService } from '@nestjs/config'; 
// 获取环境变量配置，例如JWT_SECRET和JWT_EXPIRATION

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    // 注册Mongoose模型，将AdminSchema映射到MongoDB中的admins集合

    PassportModule, 
    // 引入PassportModule以使用passport的认证策略，如local和jwt

    JwtModule.registerAsync({
      imports: [ConfigModule], 
      // 使用ConfigModule以访问环境变量
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'), 
        // 从环境变量中获取JWT_SECRET作为签名密钥
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') },
        // 从环境变量中获取JWT_EXPIRATION设定令牌有效期
      }),
      inject: [ConfigService], 
      // 注入ConfigService，以便useFactory中可获取环境变量
    }),
  ],
  providers: [AdminService, AuthService, LocalStrategy, JwtStrategy],
  // providers中声明该模块提供的服务和策略类
  // AdminService: 管理员数据处理
  // AuthService: 认证逻辑（验证密码、签发JWT）
  // LocalStrategy: 本地(用户名+密码)认证策略
  // JwtStrategy: JWT(令牌)认证策略

  controllers: [AuthController],
  // controllers中声明控制器类，用于处理HTTP请求

  exports: [AdminService],
  // 导出AdminService，使其他模块可使用该服务（如果需要）
})
export class AuthModule {}
// 定义并导出AuthModule作为认证模块