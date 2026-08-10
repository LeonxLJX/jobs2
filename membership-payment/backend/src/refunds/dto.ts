/* ============================================================
 * Refunds DTO
 * ============================================================ */
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  orderId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason: string;
}
