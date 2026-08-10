import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private teamsService: TeamsService,
    private configService: ConfigService,
  ) {}

  // 保存上传文件信息到数据库 / Persist uploaded file record
  async upload(
    file: Express.Multer.File,
    teamId: string,
    userId: string,
  ) {
    await this.teamsService.assertMember(teamId, userId);
    const record = await this.prisma.fileAsset.create({
      data: {
        teamId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        uploaderId: userId,
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
    });
    return record;
  }

  // 文件列表 / File list
  async list(teamId: string, userId: string) {
    await this.teamsService.assertMember(teamId, userId);
    return this.prisma.fileAsset.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // 删除文件（数据库 + 磁盘）/ Delete file (DB + disk)
  async remove(id: string, userId: string) {
    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.teamsService.assertMember(file.teamId, userId);

    // 删除磁盘文件 / Remove physical file
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    const filePath = join(process.cwd(), uploadDir, file.filename);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (e) {
        // 忽略磁盘删除错误 / Ignore disk deletion error
      }
    }
    await this.prisma.fileAsset.delete({ where: { id } });
    return { message: 'File deleted' };
  }

  // 生成唯一文件名 / Generate unique filename
  static generateFilename(originalname: string): string {
    const ext = extname(originalname);
    return `${randomUUID()}${ext}`;
  }

  // 确保上传目录存在 / Ensure upload directory exists
  ensureUploadDir(): string {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    const absPath = join(process.cwd(), uploadDir);
    if (!existsSync(absPath)) {
      mkdirSync(absPath, { recursive: true });
    }
    return absPath;
  }
}
