/* ============================================================
 * Users DTO
 * ============================================================ */
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(32)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar?: string;
}
