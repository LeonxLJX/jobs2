import { IsString, MinLength } from 'class-validator';

// 修改密码 DTO / Change password DTO
export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
