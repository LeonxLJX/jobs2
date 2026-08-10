/* ============================================================
 * Auth 控制器 / Auth Controller
 * ============================================================ */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return ApiResponse.ok(data, '注册成功 / Registered');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return ApiResponse.ok(data, '登录成功 / Logged in');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    const data = await this.authService.logout();
    return ApiResponse.ok(data, '登出成功 / Logged out');
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
    const data = await this.authService.changePassword(userId, dto);
    return ApiResponse.ok(data, '密码修改成功 / Password changed');
  }
}
