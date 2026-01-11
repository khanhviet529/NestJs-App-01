import { PageDto, PageMetaDto, TypeErrorOrPageDtoTuple } from 'src/common/dtos';
import { errorLogger } from './logger.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
const isValidMongoId = (v) => mongoose.Types.ObjectId.isValid(v);
@Injectable()
export class ValidateMongoIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (isValidMongoId(value)) {
      return value;
    }

    throw new BadRequestException();
  }
}

export const listMongoCollectionWithPagination = async <TResult>(
  model: any,
  pageOptionsDto,
  findFields: string[] = [],
  relations: string[] = [],
): TypeErrorOrPageDtoTuple<TResult> => {
  try {
    const whereConditionOr = {
      $or: findFields.map((field) => {
        return { [field]: { $regex: pageOptionsDto.filter, $options: 'i' } };
      }),
    };

    const itemCount = await model.countDocuments(whereConditionOr).exec();
    const dongoDocumentsList = (await model
      .find()
      .populate(relations)
      .where(whereConditionOr)
      .skip(pageOptionsDto.skip)
      .limit(pageOptionsDto.take)
      .sort({ createdAt: pageOptionsDto.order })
      .exec()) as TResult[];

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    const pageDto = new PageDto<TResult>(dongoDocumentsList, pageMetaDto);

    return [null, pageDto];
  } catch (error) {
    errorLogger(error);
    return [error as Error, null];
  }
};
