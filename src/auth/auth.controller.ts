import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
// 导入Controller、Post、Body、UseGuards、Request、Get等装饰器和方法，用于定义控制器路由和请求处理
import { AdminService } from './admin.service'; // 管理员数据服务，用于注册管理员
import { AuthService } from './auth.service'; // 认证服务，用于登录等操作
// 本地认证守卫，在请求前验证用户名密码
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginAdminDto } from './dto/login-admin.dto';
import { Response } from 'express';

import * as bcrypt from 'bcrypt';
// JWT认证守卫，在请求前验证JWT令牌有效性

@Controller('auth')
// 将此控制器下的路由均以/auth作为前缀，例如/auth/register、/auth/login、/auth/profile
export class AuthController {
  constructor(
    private readonly adminService: AdminService,
    // 注入AdminService，用于创建管理员用户
    private readonly authService: AuthService,
    // 注入AuthService，用于登录和JWT生成逻辑
  ) {}

  // @Post('register')
  // // 定义POST /auth/register路由，用于管理员注册
  // async register(@Body() createAdminDto: CreateAdminDto) {
  //   // @Body() 装饰器从请求体中解析JSON数据并映射到CreateAdminDto
  //   const admin = await this.adminService.create(createAdminDto);
  //   // 调用adminService的create方法创建新管理员（哈希密码后存储）
  //   return { message: '管理员注册成功', adminId: admin._id };
  //   // 返回JSON响应，包括成功消息和新创建管理员的ID
  // }

  // 使用本地认证守卫，在进入下个路由处理器前先验证用户名密码
  @Post('login')
  @ApiOperation({ summary: '用户登录' }) // 描述接口操作
  @ApiBody({ type: LoginAdminDto }) // 指定请求体类型
  @ApiResponse({ status: 200, description: '登录成功' }) // 描述返回结果
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() loginAdminDto: LoginAdminDto, @Res() res: Response) {
    // 通过用户名查找管理员（假设存在 adminService.findOne 方法）
    const admin = await this.adminService.findOne(loginAdminDto.username);
    const { rememberMe } = loginAdminDto;

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }
    // 验证密码（假设使用 bcrypt 比较密码）
    const isPasswordValid = await bcrypt.compare(
      loginAdminDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    const { access_token } = await this.authService.login(admin); // 传递 admin 实体到 login 方法

    const cookieObj = {
      httpOnly: true,
      secure: false, // 若部署在 HTTPS 上，改为 true
      maxAge: undefined,
    };
    if (rememberMe) {
      cookieObj.maxAge = 1 * 24 * 60 * 60 * 1000; // 1 天
    }
    res.cookie('access_token', access_token, cookieObj);
    return res.status(200).json({
      message: '登录成功',
      code: 200,
    });
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

  @UseGuards(JwtAuthGuard)
  @Get('checkAuthStatus')
  @ApiOperation({ summary: '检查当前用户的认证状态' })
  @ApiResponse({ status: 200, description: '已认证用户信息' })
  @ApiResponse({ status: 401, description: '未认证' })
  checkAuth(@Request() req) {
    // 如果通过 JwtAuthGuard，那么 req.user 就是已认证用户信息
    console.log(req)
    return {
      isAuthenticated: true,
    };
  }
}
