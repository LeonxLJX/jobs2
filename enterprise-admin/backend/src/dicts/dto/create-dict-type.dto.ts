import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 新增/编辑字典类型 DTO / Create/Update dict type DTO
export class CreateDictTypeDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
