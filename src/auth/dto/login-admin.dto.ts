import { IsString } from 'class-validator';

export class LoginAdminDto {
  @IsString()
  readonly username: string; 
  // 登录时传入的username必须是字符串

  @IsString()
  readonly password: string;
  // 登录时传入的password必须是字符串
}