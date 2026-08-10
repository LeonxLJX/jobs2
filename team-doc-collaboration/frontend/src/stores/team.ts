import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Team } from '@/api/types';
import { getMyTeams } from '@/api/teams';

// 团队 store / Team store
export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([]);
  const currentTeam = ref<Team | null>(null);

  // 拉取我所在的团队 / Fetch my teams
  async function fetchTeams() {
    teams.value = await getMyTeams();
    return teams.value;
  }

  // 设置当前团队 / Set current team
  function setCurrentTeam(team: Team | null) {
    currentTeam.value = team;
    if (team) {
      localStorage.setItem('currentTeamId', team.id);
    } else {
      localStorage.removeItem('currentTeamId');
    }
  }

  // 恢复上次选中的团队 / Restore last selected team
  function restoreCurrentTeam() {
    const id = localStorage.getItem('currentTeamId');
    if (id && teams.value.length) {
      const found = teams.value.find((t) => t.id === id);
      if (found) currentTeam.value = found;
    }
  }

  return {
    teams,
    currentTeam,
    fetchTeams,
    setCurrentTeam,
    restoreCurrentTeam,
  };
});
