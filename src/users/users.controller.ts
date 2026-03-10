import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {JwtAuthGuard} from 'src/auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  //req = request objesi ve içinde JWT’den gelen kullanıcı bilgisi (req.user) var.
  getMyUser(@Param() params: {id: string}, @Req() req) {
    return this.usersService.getMyUser(params.id, req)
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
}
