import api from './api';

export const challengesService = {
  createChallenge: async (planType) => {
    const response = await api.post('/challenges', { plan_type: planType });
    return response.data;
  },

  getChallenges: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },

  getChallenge: async (challengeId) => {
    const response = await api.get(`/challenges/${challengeId}`);
    return response.data;
  },

  startChallenge: async (challengeId) => {
    const response = await api.post(`/challenges/${challengeId}/start`);
    return response.data;
  },

  deleteChallenge: async (challengeId) => {
    const response = await api.delete(`/challenges/${challengeId}`);
    return response.data;
  },
};

export default challengesService;
