在 **NestJS** 中，`Response` 类型通常是从 `@nestjs/common` 的装饰器中注入的，它默认是一个 Express 响应对象。为了解决 `Property 'cookie' does not exist on type 'Response'` 的问题，你可以按照以下步骤操作：

---

### 1. **确保正确使用 `@Res()` 注入**
NestJS 使用 `@Res()` 装饰器来注入 `Response` 对象，但需要确保类型是 Express 的 `Response`。你可以这样导入和使用：

```typescript
import { Response } from 'express';
import { Controller, Post, Res, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  async login(@Body() admin: any, @Res() res: Response) {
    const payload = { username: admin.username, sub: admin._id };
    const accessToken = this.jwtService.sign(payload);

    // 使用 Express 的 Response 对象设置 Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true, // 防止 XSS 攻击
      secure: false, // 若使用 HTTPS，请改为 true
      sameSite: 'strict', // 防止 CSRF 攻击
      maxAge: 15 * 60 * 1000, // 15 分钟
    });

    return res.status(200).json({ message: '登录成功' });
  }
}
```

### 2. **安装必要的依赖**
如果你还没有安装 Express 的类型声明文件，安装以下依赖：

```bash
npm install --save-dev @types/express
```

这会为 `Response` 提供完整的类型支持。

---

### 3. **推荐方式：全局响应处理**
直接使用 `@Res()` 会跳过 NestJS 的全局响应拦截器。如果你希望遵循 NestJS 的最佳实践并使用框架的内置功能，可以用以下方式：

#### 设置 Cookie 的服务层代码：
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(admin: any): string {
    const payload = { username: admin.username, sub: admin._id };
    return this.jwtService.sign(payload);
  }
}
```

#### 控制器中发送 Cookie：
```typescript
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() admin: any, @Res() res: Response) {
    const token = this.authService.generateToken(admin);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: '登录成功' });
  }
}
```

---

### 4. **全局处理 Cookie 的改进方式（推荐）**
如果不想在每个路由中显式调用 `@Res()` 和 `res.cookie`，可以通过全局拦截器或中间件处理。

#### 使用全局中间件：
1. 创建一个中间件来设置 Cookie：
   ```typescript
   import { Injectable, NestMiddleware } from '@nestjs/common';
   import { Response, Request, NextFunction } from 'express';

   @Injectable()
   export class CookieMiddleware implements NestMiddleware {
     use(req: Request, res: Response, next: NextFunction) {
       res.cookie = (key: string, value: string, options: any) => {
         // 自定义 Cookie 设置逻辑
         console.log(`Setting cookie: ${key}`);
       };
       next();
     }
   }
   ```

2. 在 `main.ts` 或模块中使用：
   ```typescript
   app.use(new CookieMiddleware());
   ```

这样就可以统一处理 Cookie，无需在每个控制器中显式使用。

---

通过这些方法，你可以在 NestJS 项目中正确设置 `access_token` 到 Cookie 中，安全性和代码规范都会有所提升。

下面的代码示例展示了如何在 NestJS 中使用 Cookie 存储与验证 JWT 令牌，并附有详细注释，方便直接复制使用。假设你已经有了基本的 NestJS 项目结构，以及 `auth` 模块、`auth.controller.ts`、`auth.service.ts`、`jwt.strategy.ts` 等文件。

在此实现中，我们将：  
1. 在 `login` 接口中将 JWT `access_token` 写入 HttpOnly Cookie。  
2. 在 `jwt.strategy.ts` 中从请求的 Cookie 中提取 `access_token` 并进行验证。  
3. 配合 `cookie-parser` 中间件在 `main.ts` 中使用，以便在后端获取请求中的 Cookie。

请根据自身项目需要进行适当修改。

---

### `main.ts` 文件

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // 引入cookie-parser中间件，用于解析请求中的Cookie

async function bootstrap() {
  // 创建Nest应用
  const app = await NestFactory.create(AppModule);

  // 使用 cookie-parser 中间件解析 Cookie
  // 使用后，req.cookies 将包含客户端请求中携带的所有 Cookie
  app.use(cookieParser());

  // 启动服务器，监听3000端口
  await app.listen(3000);
}
bootstrap();
```

**说明**：  
- `cookie-parser` 可以让我们在后端方便地获取客户端传来的 Cookie。  
- 确保已安装 `cookie-parser`：`npm install cookie-parser`.

---

### `jwt.strategy.ts` 文件

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; // 使用Nest对Passport的封装类
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
// JwtStrategy用于验证JWT令牌的有效性。默认情况下，它会从请求头的Authorization中提取。
// 我们将其修改为从Cookie中提取。
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // jwtFromRequest字段可自定义从何处提取JWT令牌
      // 此处使用一个extractor函数从Cookie中获取`access_token`
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // 尝试从请求的Cookie中获取access_token
          return req.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false, // 不忽略过期，JWT过期则验证失败
      secretOrKey: configService.get<string>('JWT_SECRET'), // JWT签名密钥
    });
  }

  async validate(payload: any) {
    // validate方法返回的对象会被附加到req.user上
    // payload是JWT解码后的主体内容，包括我们签发时放入的username、sub等信息
    return { adminId: payload.sub, username: payload.username };
  }
}
```

**说明**：  
- `jwtFromRequest` 已修改为自定义extractor，从 `req.cookies.access_token` 中获取JWT。  
- `validate` 方法决定验证通过后向 `req.user` 注入何种数据。

---

### `auth.controller.ts` 文件

```typescript
import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, // AuthService用于生成JWT等
    private readonly adminService: AdminService, // AdminService用于查询管理员信息
  ) {}

  @Post('login')
  // 登录接口：验证用户名密码后，生成JWT并写入到Cookie中
  async login(
    @Body() loginAdminDto: LoginAdminDto, // 从请求体中获取用户名和密码
    @Res() res: Response, // 注入Express原生响应对象，用于设置Cookie
  ) {
    // 根据用户名查找管理员
    const admin = await this.adminService.findOne(loginAdminDto.username);
    if (!admin) {
      // 若用户不存在，则抛出401
      throw new UnauthorizedException('管理员不存在');
    }

    // 验证密码是否正确
    const isPasswordValid = await bcrypt.compare(loginAdminDto.password, admin.password);
    if (!isPasswordValid) {
      // 密码不匹配则抛出401
      throw new UnauthorizedException('密码错误');
    }

    // 调用AuthService的login方法生成JWT
    const accessToken = await this.authService.login(admin);

    // 将生成的JWT写入HttpOnly Cookie中
    // HttpOnly: true 表示客户端JavaScript无法读取该Cookie，防止XSS窃取
    // sameSite: 'strict' 减少CSRF风险
    // secure: 部署到HTTPS后建议设置为true，以保证Cookie仅通过HTTPS传输
    // maxAge: Cookie有效期，这里设为15分钟
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false, // 若上线使用HTTPS，请改为true
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15分钟
    });

    // 返回JSON响应，告知前端登录成功
    return res.status(200).json({ message: '登录成功' });
  }

  // 此处可添加其他需要登录态的接口，如GET /auth/profile
  // 使用JwtAuthGuard进行保护，在profile接口中将从Cookie中解析JWT并验证
}
```

**说明**：  
- `@Res()` 装饰器使我们能直接使用Express的 `Response` 对象，从而调用 `res.cookie()` 方法。  
- 将JWT写入Cookie后，前端无需显式在请求头中携带 Authorization。浏览器同域请求会自动带上Cookie。

---

### `auth.service.ts` 文件

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, // 用于签发和验证JWT
  ) {}

  // login方法根据admin信息生成对应的JWT令牌
  async login(admin: Admin): Promise<string> {
    // payload中可以放入一些必要信息，如用户ID(sub)和用户名(username)
    const payload = { username: admin.username, sub: admin._id };

    // 使用jwtService.sign生成JWT令牌并返回
    return this.jwtService.sign(payload);
  }
}
```

**说明**：  
- 此处的 `login` 方法仅负责返回JWT字符串，不负责设置Cookie。Cookie的设置在Controller层完成。  
- 保持职责单一化有助于代码维护和测试。

---

### 其他说明

- **CORS配置**：如果你的前端与后端是跨域部署的，并且需要前端使用 `fetch` 等请求携带 Cookie，则需在后端配置CORS允许携带凭证。

  在 `main.ts` 中（或对应的配置文件）添加：
  ```typescript
  app.enableCors({
    origin: 'http://your-frontend-domain.com', // 前端地址
    credentials: true, // 允许跨域请求携带Cookie
  });
  ```

- **访问受保护的路由**：  
  对需要认证的路由使用 `@UseGuards(JwtAuthGuard)`，JwtAuthGuard会自动调用JwtStrategy从Cookie中解析token并验证。如果验证通过，`req.user`中将包含解码后的用户信息。

  示例（在 `auth.controller.ts` 中增加一个受保护的路由）：
  ```typescript
  import { UseGuards, Get, Request } from '@nestjs/common';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // 你的JWT守卫路径

  @UseGuards(JwtAuthGuard) // 使用JWT守卫保护此路由
  @Get('profile')
  getProfile(@Request() req) {
    // 如果JWT有效，req.user中会有adminId和username等信息
    return req.user;
  }
  ```

  前端在同域下请求该接口时，浏览器会自动携带 `access_token` Cookie。确保 `fetch` 或 `axios` 请求时加上 `{ credentials: 'include' }` 选项，以便Cookie随请求发送。
  
  **示例前端请求：**
  ```javascript
  fetch('http://localhost:3000/auth/profile', {
    method: 'GET',
    credentials: 'include', // 允许跨域请求携带Cookie
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
  ```

---

### 总结

通过以上代码和注释：  
- 在 `login` 接口中，后端会校验管理员用户名和密码，并生成JWT存入HttpOnly Cookie。  
- 后续请求会自动携带该Cookie，后端通过 `JwtStrategy` 从Cookie中提取、验证JWT。  
- 无需前端手动管理或存储 `access_token`，提高安全性（HttpOnly能防止JS读取Cookie，减少XSS威胁）。  

完成后即可实现利用Cookie对JWT进行校验的认证流程。