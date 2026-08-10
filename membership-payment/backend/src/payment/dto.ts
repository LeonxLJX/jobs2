/* ============================================================
 * Payment DTO
 * ============================================================ */
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CheckoutDto {
  @IsString()
  planId: string;

  // 可选：使用积分抵扣数量 / Optional: points to use for deduction
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number;
}

export class MockWebhookDto {
  @IsString()
  sessionId: string;
}
