import { IsArray, IsString } from 'class-validator';

// 分配权限 DTO / Assign permissions DTO
export class AssignPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
