import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 
// 用于定义Mongoose Schema的装饰器
import { Document } from 'mongoose'; 
// Document是Mongoose文档类型的基类

export type AdminDocument = Admin & Document; 
// AdminDocument类型为Admin类加上Mongoose的Document属性

@Schema() 
// @Schema标记此类为Mongoose的Schema
export class Admin {
  toObject(): { [x: string]: any; password: any; } {
    throw new Error('Method not implemented.');
  }
  @Prop({ unique: true, required: true })
  // @Prop定义字段，unique:true表示该字段值必须唯一，required:true表示必填
  username: string;

  @Prop({ required: true })
  // password字段必填
  password: string; // 存储哈希后的密码
  _id: any;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
// 利用SchemaFactory将Admin类转为Mongoose的Schema对象