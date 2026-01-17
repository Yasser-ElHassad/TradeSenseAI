import { useState, useEffect, useCallback, useRef } from 'react';
import { challengesService } from '../services/challenges';
import { tradesService } from '../services/trades';

/**
 * useChallenge Hook
 * Manages challenge data fetching and state for the current user
 * 
 * @param {Object} options
 * @param {boolean} options.autoFetch - Auto-fetch on mount (default: true)
 * @param {number} options.refreshInterval - Auto-refresh interval in ms (0 to disable)
 * @returns {Object} { challenge, loading, error, refetchChallenge, clearError }
 */
const useChallenge = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0 } = options;

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const intervalRef = useRef(null);

  /**
   * Fetch active challenge and its details
   */
  const fetchChallenge = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      // Get all challenges for the user
      const challengesResponse = await challengesService.getChallenges();
      
      if (!isMountedRef.current) return;

      const challenges = challengesResponse.challenges || [];
      
      // Find active challenge (or most recent if none active)
      let activeChallenge = challenges.find(c => c.status === 'active');
      
      if (!activeChallenge && challenges.length > 0) {
        // Get the most recent challenge if no active one
        activeChallenge = challenges.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
      }

      if (!activeChallenge) {
        setChallenge(null);
        setLoading(false);
        return;
      }

      // Fetch detailed challenge info including performance metrics
      let challengeDetails = null;
      try {
        const detailsResponse = await tradesService.getChallengeDetails(activeChallenge.id);
        challengeDetails = detailsResponse;
      } catch (detailsError) {
        console.warn('Could not fetch challenge details:', detailsError);
      }

      if (!isMountedRef.current) return;

      // Compile challenge data
      const performance = challengeDetails?.performance || {};
      const challengeData = {
        // Basic info
        id: activeChallenge.id,
        status: activeChallenge.status,
        planType: activeChallenge.plan_type,
        
        // Balance info
        startingBalance: activeChallenge.starting_balance,
        currentBalance: challengeDetails?.challenge?.current_balance || activeChallenge.current_balance,
        
        // Performance metrics
        totalPnL: performance.total_pnl || 0,
        totalPnLPercent: performance.total_pnl_percent || 0,
        dailyPnL: performance.daily_pnl || 0,
        dailyPnLPercent: performance.daily_pnl_percent || 0,
        
        // Profit percentage (for convenience)
        profitPercent: performance.total_pnl_percent || 
          ((activeChallenge.current_balance - activeChallenge.starting_balance) / activeChallenge.starting_balance * 100) || 0,
        
        // Challenge rules
        rules: {
          dailyLossLimit: 5, // 5%
          maxLossLimit: 10, // 10%
          profitTarget: 10, // 10%
        },
        
        // Progress
        progressToTarget: Math.min(
          Math.max((performance.total_pnl_percent || 0) / 10 * 100, 0),
          100
        ),
        dailyLossUsed: Math.abs(Math.min(0, performance.daily_pnl_percent || 0)),
        maxLossUsed: Math.abs(Math.min(0, performance.total_pnl_percent || 0)),
        
        // Timestamps
        createdAt: activeChallenge.created_at,
        updatedAt: activeChallenge.updated_at,
        
        // Trade stats
        tradesCount: challengeDetails?.trades_count || 0,
        
        // Raw data for advanced usage
        raw: {
          challenge: activeChallenge,
          details: challengeDetails,
        },
      };

      setChallenge(challengeData);

    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch challenge';
      setError(errorMessage);
      console.error('useChallenge error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Refetch challenge data (public method)
   */
  const refetchChallenge = useCallback(() => {
    return fetchChallenge(true);
  }, [fetchChallenge]);

  /**
   * Silent refresh (no loading state)
   */
  const silentRefresh = useCallback(() => {
    return fetchChallenge(false);
  }, [fetchChallenge]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update challenge data locally (optimistic updates)
   */
  const updateChallenge = useCallback((updates) => {
    setChallenge(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      fetchChallenge(true);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoFetch, fetchChallenge]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        silentRefresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [refreshInterval, silentRefresh]);

  return {
    // State
    challenge,
    loading,
    error,
    
    // Actions
    refetchChallenge,
    silentRefresh,
    clearError,
    updateChallenge,
    
    // Convenience getters
    isActive: challenge?.status === 'active',
    isPassed: challenge?.status === 'passed',
    isFailed: challenge?.status === 'failed',
    hasChallenge: !!challenge,
  };
};

export default useChallenge;
