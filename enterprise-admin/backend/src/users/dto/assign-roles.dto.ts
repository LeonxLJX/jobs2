import { IsArray, IsString } from 'class-validator';

// 分配角色 DTO / Assign roles DTO
export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
