import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('trash')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrashController {
  constructor(private trashService: TrashService) {}

  // 回收站列表 / Trash list
  @Get()
  list(@Query('teamId') teamId: string, @CurrentUser('id') userId: string) {
    return this.trashService.list(teamId, userId);
  }

  // 恢复文档 / Restore document
  @Post(':documentId/restore')
  restore(@Param('documentId') documentId: string, @CurrentUser('id') userId: string) {
    return this.trashService.restore(documentId, userId);
  }

  // 彻底删除文档 / Permanently delete document
  @Delete(':documentId')
  purge(@Param('documentId') documentId: string, @CurrentUser('id') userId: string) {
    return this.trashService.purge(documentId, userId);
  }
}
