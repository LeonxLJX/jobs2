import { IsOptional, IsString } from 'class-validator';

// 新增/编辑角色 DTO / Create/Update role DTO
export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}
