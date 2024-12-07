import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
// ConflictException表示数据冲突（如用户名已存在），InternalServerErrorException表示服务端错误
import { InjectModel } from '@nestjs/mongoose';
// InjectModel用于将Mongoose模型注入到服务中
import { Admin, AdminDocument } from './schemas/admin.schema';
// Admin类和AdminDocument类型，用于定义管理员数据结构和文档类型
import { Model } from 'mongoose';
// Model是Mongoose的模型类型，用于对数据库集合进行CRUD操作
import { CreateAdminDto } from './dto/create-admin.dto';
// DTO用于验证和约束请求数据格式
import * as bcrypt from 'bcrypt';
// bcrypt用于对密码进行哈希

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}
  // 通过@InjectModel注入Admin对应的Mongoose模型，以进行数据库操作

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // 创建管理员用户
    const { username, password } = createAdminDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    // 将明文密码哈希，加盐10轮
    const admin = new this.adminModel({ username, password: hashedPassword });

    try {
      return await admin.save();
      // 将新管理员保存到数据库
    } catch (error) {
      if (error.code === 11000) {
        // 11000为MongoDB重复键错误码，如果用户名重复则抛出异常
        throw new ConflictException('用户名已存在');
      } else {
        throw new InternalServerErrorException();
        // 其它错误类型则抛出内部服务器错误异常
      }
    }
  }

  async findOne(username: string): Promise<Admin | undefined> {
    return await this.adminModel.findOne({ username }).exec();
    // 使用Mongoose的findOne查询，如果找到则返回AdminDocument实例，如果没找到则返回null
  }
}
