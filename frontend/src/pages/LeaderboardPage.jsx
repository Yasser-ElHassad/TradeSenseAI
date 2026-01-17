import { useState, useEffect, useCallback } from "react";
import { leaderboardService } from "../services/leaderboard";
import { useTranslation } from "react-i18next";

const TopSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-10" />
    <div className="absolute -left-32 -top-20 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
    <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="h-9 w-72 bg-white/10 rounded-xl mx-auto animate-pulse" />
        <div className="h-5 w-52 bg-white/5 rounded-lg mx-auto animate-pulse" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-lg space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-3">
              <div
                className="mx-auto rounded-full bg-white/10 animate-pulse"
                style={{ width: i === 2 ? 88 : 72, height: i === 2 ? 88 : 72 }}
              />
              <div className="h-4 w-24 bg-white/10 rounded mx-auto animate-pulse" />
              <div className="h-3 w-16 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center py-3 border-b border-white/5 last:border-none"
            >
              <div className="h-6 w-10 bg-white/10 rounded animate-pulse" />
              <div className="flex items-center gap-3 ml-4 flex-1">
                <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse ml-6 hidden sm:block" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse ml-6 hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-lg">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-sm shadow-lg">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm shadow-lg">
        3
      </span>
    );
  return <span className="text-gray-300 font-semibold">#{rank}</span>;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const { t } = useTranslation();

  const fetchLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await leaderboardService.getMonthlyLeaderboard();
      setLeaderboard(response.leaderboard || []);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(true), 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  if (loading) return <TopSkeleton />;

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute -left-28 -top-32 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl" />
      <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-noise opacity-20" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-primary-100 ring-1 ring-white/10 shadow-lg shadow-black/30 backdrop-blur">
            {t("leaderboard.title")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-200 via-white to-purple-200 bg-clip-text text-transparent">
            {t("leaderboard.topPerformers")}
          </h1>
          <p className="text-gray-300">
            {currentMonth} · {t("leaderboard.title")}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes
              every 60s
            </p>
          )}
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-center shadow-lg shadow-red-900/30 backdrop-blur">
            {error}
            <button
              onClick={() => fetchLeaderboard()}
              className="ml-3 underline hover:text-white font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        <section className="glass-panel rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
          {leaderboard.length >= 3 && (
            <div className="bg-gradient-to-r from-primary-600/70 via-purple-600/70 to-pink-600/70 px-6 md:px-10 py-8">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white text-2xl font-bold backdrop-blur shadow-lg">
                    2
                  </div>
                  <p className="text-white font-medium truncate">
                    {leaderboard[1]?.username}
                  </p>
                  <p className="text-emerald-200 text-sm font-semibold">
                    +{leaderboard[1]?.profit_percent?.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center space-y-2 -mt-6">
                  <div className="mx-auto flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-4xl font-bold border-2 border-yellow-300/60 shadow-xl">
                    1
                  </div>
                  <p className="text-white font-bold text-lg truncate">
                    {leaderboard[0]?.username}
                  </p>
                  <p className="text-emerald-100 text-xl font-bold">
                    +{leaderboard[0]?.profit_percent?.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl font-bold backdrop-blur shadow-lg">
                    3
                  </div>
                  <p className="text-white font-medium truncate">
                    {leaderboard[2]?.username}
                  </p>
                  <p className="text-emerald-200 text-sm font-semibold">
                    +{leaderboard[2]?.profit_percent?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase text-gray-300 tracking-wide">
                    Rank
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase text-gray-300 tracking-wide">
                    Trader
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold uppercase text-gray-300 tracking-wide">
                    Profit %
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-right text-xs font-semibold uppercase text-gray-300 tracking-wide">
                    Starting
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-right text-xs font-semibold uppercase text-gray-300 tracking-wide">
                    Current
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`transition hover:bg-white/5 ${
                      entry.rank === 1
                        ? "bg-yellow-400/10"
                        : entry.rank === 2
                          ? "bg-gray-400/10"
                          : entry.rank === 3
                            ? "bg-orange-400/10"
                            : ""
                    }`}
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white font-semibold">
                          {entry.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            {entry.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-emerald-300 font-bold">
                        +{entry.profit_percent?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                      ${entry.starting_balance?.toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right text-sm text-white font-semibold">
                      ${entry.current_balance?.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-300"
                    >
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      No traders on the leaderboard yet this month.
                      <br />
                      <span className="text-sm text-gray-400">
                        Be the first to complete a challenge!
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="glass-panel rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </span>
              How to Get on the Leaderboard
            </h3>
            <ul className="space-y-3 text-gray-200 text-sm">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Start a trading challenge
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Achieve positive returns within risk limits
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Top performers are highlighted monthly
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Both active and passed challenges qualify
              </li>
            </ul>
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              Stay Fresh
            </h3>
            <p className="text-gray-200 text-sm">
              Leaderboard refreshes automatically every 60 seconds. Click the
              button below for a manual refresh if you just closed a big trade.
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeaderboardPage;
