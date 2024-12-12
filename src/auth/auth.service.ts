import { Injectable, UnauthorizedException } from '@nestjs/common';
// Injectable让类可注入为服务，UnauthorizedException可在验证失败时抛出未经授权异常
import { AdminService } from './admin.service';
// 注入AdminService以查询管理员数据
import { JwtService } from '@nestjs/jwt';
// JwtService用于生成和验证JWT令牌
import * as bcrypt from 'bcrypt';
// bcrypt用于对密码进行哈希和验证
import { Admin } from './schemas/admin.schema';
// 导入Admin类型，用于类型提示
import { Response } from 'express';

@Injectable()
// 标记此类为可注入的服务类
export class AuthService {
  constructor(
    private adminService: AdminService,
    // 注入AdminService用于查找管理员用户数据
    private jwtService: JwtService,
    // 注入JwtService，用于签发JWT令牌
  ) {}

  async validateAdmin(username: string, pass: string): Promise<any> {
    // 验证管理员凭证的函数
    const admin = await this.adminService.findOne(username);
    // 根据用户名查询管理员数据
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      // 如果管理员存在并且bcrypt验证密码成功
      const { password, ...result } = admin.toObject();
      // 从admin对象中去除密码字段，并将其余信息返回
      return result;
      // 返回不包含密码的管理员信息对象
    }
    return null;
    // 验证失败则返回null，后续会触发UnauthorizedException
  }

  async login(admin: Admin) {
    // 登录函数，根据管理员信息生成JWT令牌
    const payload = { username: admin.username, sub: admin._id };
    // payload是JWT中存放的用户信息，sub通常存放用户ID
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
    };
  }
}
