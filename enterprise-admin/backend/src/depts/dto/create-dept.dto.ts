import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 新增/编辑部门 DTO / Create/Update dept DTO
export class CreateDeptDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsString()
  leader?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
