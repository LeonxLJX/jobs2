import request from './request';
import type { Team, TeamMember } from './types';

// 创建团队 / Create team
export function createTeam(data: { name: string }) {
  return request.post<unknown, Team>('/teams', data);
}

// 我所在的团队 / My teams
export function getMyTeams() {
  return request.get<unknown, Team[]>('/teams');
}

// 团队详情 / Team detail
export function getTeam(id: string) {
  return request.get<unknown, Team>(`/teams/${id}`);
}

// 成员列表 / Member list
export function getTeamMembers(id: string) {
  return request.get<unknown, TeamMember[]>(`/teams/${id}/members`);
}

// 邀请成员 / Invite member
export function inviteMember(id: string, data: { email: string; role?: string }) {
  return request.post<unknown, TeamMember>(`/teams/${id}/members`, data);
}

// 移除成员 / Remove member
export function removeMember(id: string, userId: string) {
  return request.delete<unknown, { message: string }>(`/teams/${id}/members/${userId}`);
}
