import { IsOptional, IsString } from 'class-validator';

// 新增/编辑系统配置 DTO / Create/Update system config DTO
export class CreateConfigDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
