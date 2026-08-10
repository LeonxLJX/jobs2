import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class TrashService {
  constructor(
    private prisma: PrismaService,
    private teamsService: TeamsService,
  ) {}

  // 回收站列表（按团队）/ Trash list (by team)
  async list(teamId: string, userId: string) {
    await this.teamsService.assertMember(teamId, userId);
    return this.prisma.document.findMany({
      where: { teamId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // 恢复文档 / Restore document
  async restore(documentId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || !doc.deletedAt) throw new NotFoundException('Document not in trash');
    await this.teamsService.assertMember(doc.teamId, userId);
    return this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: null },
    });
  }

  // 彻底删除文档（连同版本）/ Permanently delete document (with versions)
  async purge(documentId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || !doc.deletedAt) throw new NotFoundException('Document not in trash');
    await this.teamsService.assertMember(doc.teamId, userId);
    await this.prisma.document.delete({ where: { id: documentId } });
    return { message: 'Document permanently deleted' };
  }
}
