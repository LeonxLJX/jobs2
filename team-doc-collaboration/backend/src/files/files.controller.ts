import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// 计算上传目录绝对路径 / Compute absolute upload directory
function resolveUploadDir(): string {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const absPath = join(process.cwd(), uploadDir);
  if (!existsSync(absPath)) {
    mkdirSync(absPath, { recursive: true });
  }
  return absPath;
}

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  // 上传文件 / Upload file
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, resolveUploadDir());
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE) || 10485760,
      },
      fileFilter: (_req, file, cb) => {
        if (!file) return cb(new BadRequestException('No file provided'), false);
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!teamId) throw new BadRequestException('teamId is required');
    return this.filesService.upload(file, teamId, userId);
  }

  // 文件列表 / File list
  @Get()
  list(@Query('teamId') teamId: string, @CurrentUser('id') userId: string) {
    return this.filesService.list(teamId, userId);
  }

  // 删除文件 / Delete file
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.filesService.remove(id, userId);
  }
}
