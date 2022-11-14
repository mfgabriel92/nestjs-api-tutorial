import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '@auth/decorators/user.decorator';
import { JwtGuard } from '@auth/guards';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('/me')
  async me(@CurrentUser() user: User) {
    return user;
  }
}
