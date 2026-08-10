import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// 创建文档 DTO / Create document DTO
export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;
}

// 更新文档 DTO / Update document DTO
export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
