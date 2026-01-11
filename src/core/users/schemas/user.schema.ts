import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../../roles/schemas/role.schema';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, default: () => randomUUID() })
    emailVerificationUUID: string;

    @Prop({ required: true, default: false })
    isEmailVerifyed: boolean;

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: Role.name }],
    })
    @Type(() => Role)
    roles: Role[];
}

export type UserDocument = HydratedDocument<Role>;
// export type UserWithRoles = Entity & { roles: RoleEntity[] };
export const UserSchema = SchemaFactory.createForClass(User);