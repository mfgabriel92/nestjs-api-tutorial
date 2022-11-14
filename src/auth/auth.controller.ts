import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@auth/auth.service';
import { SignUpDto, SignInDto } from '@auth/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() data: SignUpDto) {
    return this.authService.signUp(data);
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }
}
