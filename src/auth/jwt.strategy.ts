import { Injectable } from '@nestjs/common';
// Injectable可注入
import { PassportStrategy } from '@nestjs/passport';
// PassportStrategy用于扩展Passport的策略类
import { ExtractJwt, Strategy } from 'passport-jwt';
// ExtractJwt用于从请求头中提取JWT，Strategy是jwt策略基类
import { ConfigService } from '@nestjs/config';
// 从环境变量获取JWT_SECRET
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    // 使用config获取JWT_SECRET
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies.access_token || null;
        },
      ]),
      // 指定从HTTP请求的Authorization头中提取Bearer令牌
      ignoreExpiration: false,
      // 不忽略过期时间，如果令牌过期则验证失败
      secretOrKey: config.get<string>('JWT_SECRET'),
      // 从环境变量中获取密钥，用于验证JWT的签名
    });
  }

  async validate(payload: any) {
    // validate方法用于从已验证的JWT中提取信息并返回给后续请求
    return { adminId: payload.sub, username: payload.username };
    // 返回对象将作为req.user的值
  }
}
