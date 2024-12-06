import { Injectable } from '@nestjs/common'; 
// 可注入
import { AuthGuard } from '@nestjs/passport'; 
// 使用passport策略的守卫基类

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// 使用'jwt'策略的认证守卫
// 在路由上使用该守卫时，会先验证JWT有效性