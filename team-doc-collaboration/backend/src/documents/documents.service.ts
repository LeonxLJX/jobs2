import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamsService } from '../teams/teams.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private teamsService: TeamsService,
  ) {}

  // 创建文档 / Create document
  async create(userId: string, dto: CreateDocumentDto) {
    // 校验是否为团队成员 / Assert team membership
    await this.teamsService.assertMember(dto.teamId, userId);

    return this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          teamId: dto.teamId,
          title: dto.title,
          content: dto.content ?? '',
          ownerId: userId,
          currentVersion: 1,
        },
      });
      // 创建首个版本快照 / Create initial version snapshot
      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          version: 1,
          title: doc.title,
          content: doc.content,
          editorId: userId,
        },
      });
      return doc;
    });
  }

  // 文档列表（按团队，排除回收站）/ List documents (by team, excluding trash)
  async list(teamId: string, userId: string) {
    await this.teamsService.assertMember(teamId, userId);
    return this.prisma.document.findMany({
      where: { teamId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { versions: true } },
      },
    });
  }

  // 文档详情 / Document detail
  async findOne(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);
    return doc;
  }

  // 更新文档（标题或内容变化时保存版本）/ Update document (save version on change)
  async update(id: string, userId: string, dto: UpdateDocumentDto) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);

    // 判断内容是否真的变化 / Determine if content actually changed
    const titleChanged = dto.title !== undefined && dto.title !== doc.title;
    const contentChanged = dto.content !== undefined && dto.content !== doc.content;
    const shouldVersion = titleChanged || contentChanged;

    return this.prisma.$transaction(async (tx) => {
      const nextVersion = shouldVersion ? doc.currentVersion + 1 : doc.currentVersion;
      const updated = await tx.document.update({
        where: { id },
        data: {
          title: dto.title ?? doc.title,
          content: dto.content ?? doc.content,
          currentVersion: nextVersion,
        },
      });
      // 内容变化则保存版本快照 / Save version snapshot if content changed
      if (shouldVersion) {
        await tx.documentVersion.create({
          data: {
            documentId: id,
            version: nextVersion,
            title: updated.title,
            content: updated.content,
            editorId: userId,
          },
        });
      }
      return updated;
    });
  }

  // 获取当前版本号（供前端轮询比对）/ Get current version number (for polling)
  async getVersion(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);
    return { id: doc.id, currentVersion: doc.currentVersion, updatedAt: doc.updatedAt };
  }

  // 软删除文档（进入回收站）/ Soft delete (move to trash)
  async remove(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // 版本历史列表 / Version history list
  async listVersions(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);
    return this.prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { version: 'desc' },
      include: { editor: { select: { id: true, name: true, email: true } } },
    });
  }

  // 恢复到指定版本 / Restore to a specific version
  async restoreVersion(id: string, versionId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found');
    await this.teamsService.assertMember(doc.teamId, userId);

    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.documentId !== id) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const nextVersion = doc.currentVersion + 1;
      const updated = await tx.document.update({
        where: { id },
        data: {
          title: version.title,
          content: version.content,
          currentVersion: nextVersion,
        },
      });
      // 恢复也产生一个新版本快照 / Restore also creates a new version snapshot
      await tx.documentVersion.create({
        data: {
          documentId: id,
          version: nextVersion,
          title: version.title,
          content: version.content,
          editorId: userId,
        },
      });
      return updated;
    });
  }
}
