import { Injectable } from '@nestjs/common';
import { CreateRoleDto as CreateDto } from './dto/create-role.dto';
import { UpdateRoleDto as UpdateDto } from './dto/update-role.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  IService,
  TupleErrorOrData,
} from '../../common/interfaces/service.interface';
import { PageOptionsDto, TypeErrorOrPageDtoTuple } from '../../common/dtos';
import { errorLogger } from '../../utils/logger.utils';
import { listMongoCollectionWithPagination } from '../../utils/mongo.utils';
import {
  Role as Entity,
  RoleDocument as MongoDocument,
} from './schemas/role.schema';

import { TypeMongoId } from '../../common/types.common';
@Injectable()
export class RolesService implements IService {
  constructor(
    @InjectModel(Entity.name)
    private readonly model: Model<Entity>,
  ) {}

  async create(createDto: CreateDto): TupleErrorOrData<MongoDocument> {
    try {
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
  ): TypeErrorOrPageDtoTuple<MongoDocument> {
    try {
      const [error, data] = await listMongoCollectionWithPagination(
        this.model,
        pageOptionsDto,
      );

      if (error) return [error, null];

      return [null, data];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async one(id: string): TupleErrorOrData<MongoDocument> {
    try {
      const document = await this.model.findById(id).exec();
      return [null, document];
    } catch (err) {
      errorLogger(err);
      return [err, null];
    }
  }

  async oneByTitle(title: string): TupleErrorOrData<MongoDocument> {
    try {
      const document = await this.model.findOne({ title: title }).exec();
      return [null, document];
    } catch (error) {
      errorLogger(error);
      return [error, null];
    }
  }

  async many(ids: TypeMongoId[]): TupleErrorOrData<MongoDocument[]> {
    try {
      const documents = await this.model.find({ _id: { $in: ids } }).exec();
      return [null, documents];
    } catch (err) {
      errorLogger(err);
      return [err, null];
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

  async update(
    id: string,
    updateDto: UpdateDto,
  ): TupleErrorOrData<MongoDocument> {
    try {
      const document = await this.model.findById(id).exec();
      await this.model.updateOne(updateDto);
      return [null, document];
    } catch (error) {
      errorLogger(error);
      return [error, null];
    }
  }
}
