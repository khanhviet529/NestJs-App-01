import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Res,
  Version,
  Post,
} from '@nestjs/common';
import { CreateRoleDto as CreateDto } from './dto/create-role.dto';
import { UpdateRoleDto as UpdateDto } from './dto/update-role.dto';
import { RolesService as SchemaService } from './roles.service';
import { PageOptionsDto } from '../../common/dtos';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ValidateMongoIdPipe } from '../../utils/mongo.utils';
import { ResponseHandlerService } from 'src/utils/response.handler.utils';
import { RoutesService } from './routes.service';
@Controller('role')
@ApiTags('Role Management')
@ApiBearerAuth('jwt')
export class RolesController {
  private readonly entityTitle = 'role';
  constructor(
    private readonly service: SchemaService,
    private readonly rhService: ResponseHandlerService,
    private readonly routesService: RoutesService,
  ) {}

  @Get('page')
  @Version('1')
  async list(@Res() res, @Query() pageOptionsDto: PageOptionsDto) {
    const [error, pageDto] = await this.service.list(pageOptionsDto);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot get ${this.entityTitle}s list`,
      );

    return this.rhService.dataPaginatedHandler(res, pageDto);
  }

  @Get('routes')
  @Version('1')
  async routes(@Res() res) {
    return res.json(this.routesService.listRoutes());
  }

  @Get(':id')
  @Version('1')
  async one(@Res() res, @Param('id', ValidateMongoIdPipe) id: string) {
    const [error, role] = await this.service.one(id);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot get ${this.entityTitle} details`,
      );

    if (!role) {
      return this.rhService.notFoundHandler(res, `${this.entityTitle}`);
    }

    return this.rhService.dataHandler(res, role);
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

  @Patch(':id')
  @Version('1')
  async update(
    @Res() res,
    @Param('id', ValidateMongoIdPipe) id: string,
    @Body() updateDto: UpdateDto,
  ) {
    const [error] = await this.service.update(id, updateDto);

    if (error)
      return this.rhService.errorHandler(
        res,
        error,
        `cannot update ${this.entityTitle}`,
      );

    return this.rhService.updatedHandler(res, this.entityTitle);
  }
}
