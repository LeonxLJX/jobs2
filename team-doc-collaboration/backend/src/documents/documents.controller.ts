import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  // 文档列表（按团队）/ Document list (by team)
  @Get()
  list(@Query('teamId') teamId: string, @CurrentUser('id') userId: string) {
    return this.documentsService.list(teamId, userId);
  }

  // 创建文档 / Create document
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(userId, dto);
  }

  // 文档详情 / Document detail
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.findOne(id, userId);
  }

  // 获取当前版本号（轮询用）/ Get current version (for polling)
  @Get(':id/version')
  getVersion(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.getVersion(id, userId);
  }

  // 更新文档 / Update document
  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, userId, dto);
  }

  // 删除文档（软删除）/ Delete document (soft delete)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.remove(id, userId);
  }

  // 版本历史列表 / Version history list
  @Get(':id/versions')
  listVersions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.listVersions(id, userId);
  }

  // 恢复到指定版本 / Restore to a specific version
  @Post(':id/versions/:versionId/restore')
  restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.restoreVersion(id, versionId, userId);
  }
}
