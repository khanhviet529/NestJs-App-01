import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TypeRoutePersmission } from '../../../common/types.common';

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  permissions: TypeRoutePersmission[]
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = SchemaFactory.createForClass(Role);