import api from './api';

export const marketService = {
  getPrice: async (symbol) => {
    const response = await api.get(`/market/price/${symbol}`);
    return response.data;
  },

  getPrices: async (symbols) => {
    const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
    const response = await api.get(`/market/prices?symbols=${symbolsParam}`);
    return response.data;
  },
};

export default marketService;
