import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '@database/prisma.service';
import { SignInDto, SignUpDto } from '@auth/dtos';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(data: SignUpDto) {
    try {
      const user = await this.createUser(data);
      const accessToken = await this.signToken(user.data.id, user.data.email);
      return { accessToken };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('E-mail is already taken');
        }
      }
    }
  }

  async signIn(data: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email or password do not match');
    }

    const passwordsMatch = await argon.verify(user.password, data.password);

    if (!passwordsMatch) {
      throw new UnauthorizedException('Email or password do not match');
    }

    const accessToken = await this.signToken(user.id, user.email);
    return { accessToken };
  }

  private async createUser(data: SignUpDto) {
    const hashedPassword = await argon.hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        password: hashedPassword,
      },
    });

    return { data: user };
  }

  private async signToken(id: string, email: string): Promise<string> {
    const payload = {
      sub: id,
      email,
    };

    return this.jwtService.signAsync(payload);
  }
}
