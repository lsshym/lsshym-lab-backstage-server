import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({
    description: '用户名',
    type: String,
  })
  @IsString()
  readonly username: string;
  // 登录时传入的username必须是字符串
  
  @ApiProperty({
    description: '密码',
    type: String,
  })
  @IsString()
  readonly password: string;
  // 登录时传入的password必须是字符串
}
