import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTeamDto, InviteMemberDto } from './dto/team.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  // 创建团队 / Create team
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(userId, dto);
  }

  // 我所在的团队列表 / My teams
  @Get()
  findMyTeams(@CurrentUser('id') userId: string) {
    return this.teamsService.findMyTeams(userId);
  }

  // 团队详情 / Team detail
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.teamsService.findOne(id, userId);
  }

  // 成员列表 / Member list
  @Get(':id/members')
  listMembers(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.teamsService.listMembers(id, userId);
  }

  // 邀请成员 / Invite member
  @Post(':id/members')
  invite(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamsService.invite(id, userId, dto);
  }

  // 移除成员 / Remove member
  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamsService.removeMember(id, userId, targetUserId);
  }
}
