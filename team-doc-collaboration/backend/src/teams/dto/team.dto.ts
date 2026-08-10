import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

// 创建团队 DTO / Create team DTO
export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// 邀请成员 DTO（按邮箱）/ Invite member DTO (by email)
export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: string; // team_admin | member，默认 member
}
