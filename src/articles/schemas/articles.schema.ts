// src/blog/schemas/blog.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticlesDocument = Articles & Document;

@Schema({ timestamps: true })
export class Articles {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  published: boolean;

  @Prop({ default: Date.now })
  createdAt: Date; // 创建时间
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);
