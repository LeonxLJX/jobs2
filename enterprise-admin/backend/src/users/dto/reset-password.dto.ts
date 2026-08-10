import { IsString, MinLength } from 'class-validator';

// 重置密码 DTO / Reset password DTO
export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}
