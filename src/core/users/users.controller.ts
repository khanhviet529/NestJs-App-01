import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  Version,
} from '@nestjs/common';
import { UsersService as SchemaService, UserWithRoles } from './users.service';
import { CreateUserDto as CreateDto } from './dto/create-user.dto';
import { UpdateUserDto as UpdateDto } from './dto/update-user.dto';
import { ResponseHandlerService } from 'src/utils/response.handler.utils';
import { PageOptionsDto } from 'src/common/dtos';
import { ValidateMongoIdPipe } from 'src/utils/mongo.utils';
import { hashMake } from 'src/utils/encryption.utils';
import { EnumFieldsFilterMode } from 'src/utils/object.utils';
import { ObjectTransformerLib } from 'src/utils/object.transformers.lib';
@Controller('user')
export class UsersController {
  private readonly entityTitle = 'user';
  constructor(
    private readonly service: SchemaService,
    private readonly rhService: ResponseHandlerService,
  ) {}

  @Get('page')
  @Version('1')
  async list(@Res() res, @Query() pageOptionsDto: PageOptionsDto) {
    const [error, pageDto] = await this.service.list(pageOptionsDto, [
      'name',
      'username',
    ]);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot get ${this.entityTitle}s list`,
      );

    if (pageDto) {
      pageDto.data = new ObjectTransformerLib<UserWithRoles>(pageDto.data)
        .mongoToPureJSON()
        .filterFields(EnumFieldsFilterMode.remove, ['password', '__v'])
        .getData() as UserWithRoles[];
    }

    return this.rhService.dataPaginatedHandler(res, pageDto);
  }

  @Get(':id')
  @Version('1')
  async one(@Res() res, @Param('id', ValidateMongoIdPipe) id: string) {
    const [error, user] = await this.service.one(id);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot get ${this.entityTitle} details`,
      );

    let _user = user;
    if (user) {
      _user = new ObjectTransformerLib<UserWithRoles>(user)
        .mongoToPureJSON()
        .filterFields(EnumFieldsFilterMode.remove, ['password', '__v'])
        .getData() as UserWithRoles;
    }

    return this.rhService.dataHandler(res, _user);
  }

  @Post()
  @Version('1')
  async create(@Res() res, @Body() createDto: CreateDto) {
    const [error] = await this.service.create(createDto);
    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot create ${this.entityTitle}`,
      );

    return this.rhService.createdHandler(res, this.entityTitle);
  }

  @Patch(':id')
  @Version('1')
  async update(
    @Res() res,
    @Param('id', ValidateMongoIdPipe) id: string,
    @Body() updateDto: UpdateDto,
  ) {
    if (updateDto.password)
      updateDto.password = await hashMake(updateDto.password);
    const [error] = await this.service.update(id, updateDto);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot update ${this.entityTitle}`,
      );

    return this.rhService.updatedHandler(res, this.entityTitle);
  }

  @Delete(':id')
  @Version('1')
  async delete(@Res() res, @Param('id', ValidateMongoIdPipe) id: string) {
    const [error] = await this.service.remove(id);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot delete ${this.entityTitle}`,
      );

    return this.rhService.deletedHandler(res, this.entityTitle);
  }
}
