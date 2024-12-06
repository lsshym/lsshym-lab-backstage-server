import { Injectable } from '@nestjs/common'; 
// Injectable使该类可被注入
import { AuthGuard } from '@nestjs/passport'; 
// AuthGuard包装passport策略为Nest的守卫（Guard）

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
// 使用'local'策略的认证守卫
// 在路由上使用该守卫时，会先执行local策略的validate方法验证用户名和密码