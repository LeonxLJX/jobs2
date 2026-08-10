import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录 / Login
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 登出 / Logout
  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  // 修改密码 / Change password
  @Post('change-password')
  changePassword(@CurrentUser('userId') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  // 获取当前用户信息 / Get current user profile
  @Get('profile')
  profile(@CurrentUser('userId') userId: string) {
    return this.authService.profile(userId);
  }

  // 获取当前用户菜单树 / Get current user menu tree
  @Get('menus')
  menus(@CurrentUser('userId') userId: string) {
    return this.authService.menus(userId);
  }
}
