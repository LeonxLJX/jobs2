import { IsString, MinLength } from 'class-validator';

// 登录 DTO / Login DTO
export class LoginDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
