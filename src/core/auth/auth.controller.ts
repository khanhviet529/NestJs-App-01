import {
  Controller,
  Get,
  Post,
  Body,
  Version,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseHandlerService } from 'src/utils/response.handler.utils';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, LocalAuthGuard } from './auth.guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rh: ResponseHandlerService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Version('1')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username);
  }

  @Get('profile')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  getProfile(@Req() req) {
    return req.user;
  }
}
