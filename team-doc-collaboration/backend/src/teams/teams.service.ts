import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, InviteMemberDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  // 创建团队（创建者自动成为 team_admin）/ Create team (creator becomes team_admin)
  async create(userId: string, dto: CreateTeamDto) {
    return this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: dto.name,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'team_admin',
            },
          },
        },
        include: { members: { include: { user: { select: { id: true, email: true, name: true, role: true } } } } },
      });
      return team;
    });
  }

  // 查询当前用户所在的团队 / List teams of current user
  async findMyTeams(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            owner: { select: { id: true, email: true, name: true } },
            _count: { select: { members: true, documents: true } },
          },
        },
      },
    });
    return memberships.map((m) => ({ ...m.team, myRole: m.role }));
  }

  // 团队详情 / Team detail
  async findOne(teamId: string, userId: string) {
    await this.assertMember(teamId, userId);
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        members: {
          include: { user: { select: { id: true, email: true, name: true, role: true } } },
        },
        _count: { select: { documents: true, files: true } },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  // 成员列表 / Member list
  async listMembers(teamId: string, userId: string) {
    await this.assertMember(teamId, userId);
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members;
  }

  // 邀请成员（按邮箱）/ Invite member by email
  async invite(teamId: string, userId: string, dto: InviteMemberDto) {
    await this.assertTeamAdmin(teamId, userId);
    const invitee = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!invitee) throw new NotFoundException('User not found with this email');
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: invitee.id } },
    });
    if (existing) throw new ConflictException('User already a member of this team');
    const member = await this.prisma.teamMember.create({
      data: {
        teamId,
        userId: invitee.id,
        role: dto.role === 'team_admin' ? 'team_admin' : 'member',
      },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });
    return member;
  }

  // 移除成员 / Remove member
  async removeMember(teamId: string, userId: string, targetUserId: string) {
    await this.assertTeamAdmin(teamId, userId);
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (team && team.ownerId === targetUserId) {
      throw new ForbiddenException('Cannot remove the team owner');
    }
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });
    if (!member) throw new NotFoundException('Member not found in this team');
    await this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });
    return { message: 'Member removed' };
  }

  // 校验是否为团队成员 / Assert user is a team member
  async assertMember(teamId: string, userId: string) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }
    return membership;
  }

  // 校验是否为团队管理员 / Assert user is a team admin
  private async assertTeamAdmin(teamId: string, userId: string) {
    const membership = await this.assertMember(teamId, userId);
    // super_admin 拥有全部权限 / super_admin has all permissions
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'super_admin') return;
    if (membership.role !== 'team_admin') {
      throw new ForbiddenException('Team admin permission required');
    }
  }
}
