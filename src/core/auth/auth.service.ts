import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { errorLogger } from 'src/utils/logger.utils';
import { CheckUserDto } from '../users/dto/check.user.dto';
import {
  EnumFieldsFilterMode,
  ObjectTransformerLib,
} from 'src/utils/object.transformers.lib';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(checkUserDto: CheckUserDto) {
    try {
      const [error, user] =
        await this.usersService.checkUserPassword(checkUserDto);

      if (error) {
        errorLogger(error);
        return null;
      }

      // if (!user || user.isEmailVerifyed === false) return null;
      if (!user ) return null;

      const result = new ObjectTransformerLib(user)
        .mongoToPureJSON()
        .filterFields(EnumFieldsFilterMode.remove, [
          'createdAt',
          'updatedAt',
          '__v',
          'password',
        ])
        .getData();

      return result;
    } catch (error) {
      errorLogger(error);
      return null;
    }
  }

  async login(username: string) {
    const [error, user] = await this.usersService.oneByUsername(username);

    if (error || !user) {
      errorLogger(error);
      return null;
    }

    const userRoles = new ObjectTransformerLib(user.roles)
      .mongoToPureJSON()
      .filterFields(EnumFieldsFilterMode.remove, [
        'createdAt',
        'updatedAt',
        '__v',
        '_id',
        'title',
      ])
      .getData();

    const payload = {
      username: user.username,
      sub: String(user['_id']),
      roles: userRoles,
    };
    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      roles: userRoles,
    };
  }
}
