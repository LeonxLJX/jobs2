/* ============================================================
 * Plans 控制器 / Plans Controller
 * ============================================================ */
import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import { ApiResponse } from '../common/api-response';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async list() {
    const data = await this.plansService.listPlans();
    return ApiResponse.ok(data);
  }
}
