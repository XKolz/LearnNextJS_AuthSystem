// src/profile.controller.ts
import { Controller, Get, UseGuards, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './auth/decorators/user.decorator';
import { User } from './auth/entities/user.entity';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Controller('profile')
@UseFilters(HttpExceptionFilter)
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@GetUser() user: User) {
    return user;
  }
}
