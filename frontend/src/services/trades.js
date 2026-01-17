import api from './api';

export const tradesService = {
  executeTrade: async (challengeId, symbol, action, quantity) => {
    const response = await api.post('/trades/execute', {
      challenge_id: challengeId,
      symbol,
      action,
      quantity,
    });
    return response.data;
  },

  getTradeHistory: async (challengeId) => {
    const response = await api.get(`/trades/history/${challengeId}`);
    return response.data;
  },

  getChallengeDetails: async (challengeId) => {
    const response = await api.get(`/trades/challenges/${challengeId}`);
    return response.data;
  },

  getAllTrades: async () => {
    const response = await api.get('/trades');
    return response.data;
  },
};

export default tradesService;
