import {
  ForbiddenException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, AuthLoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // generate the hash
    const hash = await argon.hash(dto.password);

    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          hash,
        },
      });
      // return the saved user

      return this.signToken(user.id, user.firstName, user.email);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new BadRequestException('Email address is already registered');
        }
      }
      throw err;
    }
  }

  async login(dto: AuthLoginDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user doesn't exist, throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect!');

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);

    // if password incorrect, throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect!');

    // send back the user
    return this.signToken(user.id, user.firstName, user.email);
  }

  async signToken(userId: number, name: string, email: string) {
    const payload = {
      sub: userId,
      name,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
