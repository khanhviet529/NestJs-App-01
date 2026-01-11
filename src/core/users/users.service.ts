import { Injectable } from '@nestjs/common';
import { CreateUserDto as CreateDto } from './dto/create-user.dto';
import { UpdateUserDto as UpdateDto } from './dto/update-user.dto';
import {
  IService,
  TupleErrorOrData,
} from 'src/common/interfaces/service.interface';
import {
  User as Entity,
  UserDocument as MongoDocument,
} from './schemas/user.schema';
import { Role as RoleEntity } from '../roles/schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { errorLogger } from 'src/utils/logger.utils';
import { hashCompare, hashMake } from 'src/utils/encryption.utils';
import { PageOptionsDto, TypeErrorOrPageDtoTuple } from 'src/common/dtos';
import { listMongoCollectionWithPagination } from 'src/utils/mongo.utils';
import { CheckUserDto } from './dto/check.user.dto';

export type UserWithRoles = Entity & { roles: RoleEntity[] };
type searchKeys = keyof typeof Entity.prototype;

@Injectable()
export class UsersService implements IService {
  constructor(
    @InjectModel(Entity.name)
    @InjectModel(RoleEntity.name)
    private readonly model: Model<Entity>,
  ) {}

  async create(createDto: CreateDto): TupleErrorOrData<UserWithRoles> {
    try {
      createDto.password = await hashMake(createDto.password);

      const document = new this.model(createDto);

      const userDoc = await document.save();
      return [null, userDoc];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async list(
    pageOptionsDto: PageOptionsDto,
    findFields: searchKeys[] = [],
  ): TypeErrorOrPageDtoTuple<UserWithRoles> {
    try {
      const [error, pageDto] =
        await listMongoCollectionWithPagination<UserWithRoles>(
          this.model,
          pageOptionsDto,
          findFields,
          ['roles'],
        );

      if (error) return [error, null];

      return [null, pageDto];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async oneByUsername(username: string): TupleErrorOrData<UserWithRoles> {
    try {
      const document = await this.model
        .findOne({ username: username })
        .populate('roles')
        .exec();

      if (!document) return [null, null];

      return [null, document];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async oneByEmail(email: string): TupleErrorOrData<UserWithRoles> {
    try {
      const document = await this.model.findOne({ email: email }).exec();

      if (!document) return [null, null];

      return [null, document];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async one(id: string): TupleErrorOrData<UserWithRoles> {
    try {
      const document = await this.model.findById(id).populate('roles').exec();

      if (!document) return [null, null];

      return [null, document];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async oneByUUID(uuid: string): TupleErrorOrData<UserWithRoles> {
    try {
      const document = await this.model
        .findOne({ emailVerificationUUID: uuid })
        .exec();

      if (!document) return [null, null];

      return [null, document];
    } catch (error) {
      errorLogger(error);
      return [error, null];
    }
  }

  async checkUserPassword(
    checkPassowrd: CheckUserDto,
  ): TupleErrorOrData<UserWithRoles> {
    try {
      const document = await this.model
        .findOne({ username: checkPassowrd.username })
        .populate('roles')
        .exec();

        console.log(document)
      if (!document) return [null, null];

      const isSame = await hashCompare(
        checkPassowrd.password,
        document.password,
      );
      return isSame ? [null, document] : [null, null];
    } catch (error) {
      errorLogger(error);
      return [error, null];
    }
  }

  async update(
    id: string,
    updateDto: UpdateDto,
  ): TupleErrorOrData<UserWithRoles> {
    try {
      if (updateDto.password) {
        updateDto.password = await hashMake(updateDto.password);
      }

      const updatedUser = await this.model
        .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
        .exec();

      if (!updatedUser) return [null, null];

      return [null, updatedUser];
    } catch (error) {
      errorLogger(error);
      return [error, null];
    }
  }

  async remove(id: string): TupleErrorOrData<boolean> {
    try {
      await this.model.findByIdAndDelete(id).exec();
      return [null, true];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }
}
