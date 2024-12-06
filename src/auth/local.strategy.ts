import { Strategy } from 'passport-local'; 
// passport-local策略，用于基于用户名和密码进行认证
import { PassportStrategy } from '@nestjs/passport'; 
// PassportStrategy是NestJS对passport策略的包装类
import { Injectable, UnauthorizedException } from '@nestjs/common'; 
// Injectable可注入，UnauthorizedException可在验证失败时抛出
import { AuthService } from './auth.service'; 
// AuthService中有验证管理员的方法

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); 
    // 使用默认配置，即期望请求中有username和password字段
  }

  async validate(username: string, password: string): Promise<any> {
    // validate方法由Passport自动调用，用于验证用户凭证
    const admin = await this.authService.validateAdmin(username, password);
    // 调用authService.validateAdmin验证管理员的用户名和密码
    if (!admin) {
      // 如果验证失败则抛出未经授权异常
      throw new UnauthorizedException('用户名或密码不正确');
    }
    return admin; 
    // 返回验证通过的管理员信息，后续会附加到req.user上
  }
}