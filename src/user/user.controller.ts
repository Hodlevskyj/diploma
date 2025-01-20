import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async registerUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.userService.createUser(body);
  }

  @Post('verify')
  async verifyUser(@Body() body: { email: string }) {
    return this.userService.verifyUser(body.email);
  }

  @Get(':email')
  async getUser(@Param('email') email: string) {
    return this.userService.findUserByEmail(email);
  }
}
