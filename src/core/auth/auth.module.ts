import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ResponseHandlerService } from 'src/utils/response.handler.utils';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const parsedNumber = Number(configService.get('JWT_EXPIRES_IN'));
        const expiresIn =
          !Number.isNaN(parsedNumber) && parsedNumber > 0 ? parsedNumber : 3600;

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, ResponseHandlerService],
})
export class AuthModule {}
