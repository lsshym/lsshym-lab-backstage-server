import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common'; 
// 导入Controller、Post、Body、UseGuards、Request、Get等装饰器和方法，用于定义控制器路由和请求处理
import { AdminService } from './admin.service'; // 管理员数据服务，用于注册管理员
import { AuthService } from './auth.service'; // 认证服务，用于登录等操作
import { CreateAdminDto } from './dto/create-admin.dto'; 
// 用于管理员注册的DTO对象定义，验证输入数据格式
import { LocalAuthGuard } from './local-auth.guard'; 
// 本地认证守卫，在请求前验证用户名密码
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; 
// JWT认证守卫，在请求前验证JWT令牌有效性

@Controller('auth') 
// 将此控制器下的路由均以/auth作为前缀，例如/auth/register、/auth/login、/auth/profile
export class AuthController {
  constructor(
    private readonly adminService: AdminService,
    // 注入AdminService，用于创建管理员用户
    private readonly authService: AuthService
    // 注入AuthService，用于登录和JWT生成逻辑
  ) {}

  @Post('register')
  // 定义POST /auth/register路由，用于管理员注册
  async register(@Body() createAdminDto: CreateAdminDto) {
    // @Body() 装饰器从请求体中解析JSON数据并映射到CreateAdminDto
    const admin = await this.adminService.create(createAdminDto);
    // 调用adminService的create方法创建新管理员（哈希密码后存储）
    return { message: '管理员注册成功', adminId: admin._id };
    // 返回JSON响应，包括成功消息和新创建管理员的ID
  }

  @UseGuards(LocalAuthGuard)
  // 使用本地认证守卫，在进入下个路由处理器前先验证用户名密码
  @Post('login')
  // 定义POST /auth/login路由，用于管理员登录
  async login(@Request() req) {
    // @Request() 获取请求对象，LocalAuthGuard验证通过后会将管理员信息挂载在req.user上
    return this.authService.login(req.user);
    // 调用authService的login方法，根据管理员信息生成JWT令牌并返回
  }

  @UseGuards(JwtAuthGuard)
  // 使用JWT认证守卫，在进入该路由前先验证JWT令牌的有效性
  @Get('profile')
  // 定义GET /auth/profile，用于获取管理员个人资料（需已登录）
  getProfile(@Request() req) {
    // JWT验证通过后，req.user中包含解析JWT得到的adminId和username
    return req.user;
    // 返回管理员的基本信息，如adminId和username
  }
}