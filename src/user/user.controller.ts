import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getUsers() {
    return await this.prisma.user.findMany();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: Request) {
    console.log({
      user: req.user,
    });

    return {
      user: req.user,
    };
  }
}
