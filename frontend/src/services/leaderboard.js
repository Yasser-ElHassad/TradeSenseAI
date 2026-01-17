import api from './api';

export const leaderboardService = {
  getMonthlyLeaderboard: async () => {
    const response = await api.get('/leaderboard/monthly');
    return response.data;
  },
};

export default leaderboardService;
