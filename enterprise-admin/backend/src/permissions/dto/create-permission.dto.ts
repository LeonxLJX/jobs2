import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 新增/编辑权限 DTO / Create/Update permission DTO
export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  type: string; // menu | button

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}
