import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { ResponseHandlerService } from 'src/utils/response.handler.utils';
import { RoutesService } from './routes.service';
import { DiscoveryModule } from '@nestjs/core';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    DiscoveryModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, ResponseHandlerService, RoutesService],
})
export class RolesModule {}
