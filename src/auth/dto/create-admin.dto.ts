import { IsString, MinLength, MaxLength } from 'class-validator'; 
// 这些装饰器用于验证字段是否为字符串并检查长度

export class CreateAdminDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  readonly username: string;
  // username必须是字符串，长度在4到20之间

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;
  // password必须是字符串，长度在6到20之间
}