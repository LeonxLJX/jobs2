import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 新增/编辑字典项 DTO / Create/Update dict item DTO
export class CreateDictItemDto {
  @IsString()
  dictTypeId: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
