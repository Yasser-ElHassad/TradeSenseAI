import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const { t } = useTranslation();

  // Smooth scroll animation on mount
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          entry.target.classList.remove("opacity-0", "translate-y-8");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Hero Section with Gradient */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 start-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 end-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="glass-panel bg-white/10 dark:bg-white/5 border border-white/20 rounded-3xl px-6 sm:px-12 py-12 text-center space-y-8 shadow-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-primary-100 text-sm font-medium border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full me-2 animate-pulse"></span>
              {t("landing.trustedBy")}
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight">
              <span className="block">TradeSense</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-primary-100 leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>

            <div className="grid gap-4 sm:grid-cols-3 text-left text-white/90">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-sm uppercase tracking-wide text-primary-100/80">
                  Precision
                </p>
                <p className="font-semibold text-lg">
                  AI signals + live risk control
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-sm uppercase tracking-wide text-primary-100/80">
                  Speed
                </p>
                <p className="font-semibold text-lg">
                  Fast-track verification & instant reset
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-sm uppercase tracking-wide text-primary-100/80">
                  Support
                </p>
                <p className="font-semibold text-lg">
                  Arabic, French & English concierge
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-900 bg-white rounded-xl shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>{t("landing.startChallenge")}</span>
                <svg
                  className="ms-2 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                {t("landing.viewLeaderboard")}
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-left mt-4">
              <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mb-3">
                  1
                </div>
                <p className="font-semibold text-white">Pick your challenge</p>
                <p className="text-sm text-primary-100/80">
                  Select balance, rules, and language.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mb-3">
                  2
                </div>
                <p className="font-semibold text-white">
                  Trade with AI guardrails
                </p>
                <p className="text-sm text-primary-100/80">
                  Signals, risk alerts, and instant stats.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mb-3">
                  3
                </div>
                <p className="font-semibold text-white">Pass & get spotlight</p>
                <p className="text-sm text-primary-100/80">
                  Climb the leaderboard and unlock perks.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-10 pt-6 border-t border-white/10">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  $50M+
                </div>
                <div className="text-primary-200 text-sm mt-1">
                  {t("landing.stats.virtualFunds")}
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  10K+
                </div>
                <div className="text-primary-200 text-sm mt-1">
                  {t("landing.stats.activeTraders")}
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  95%
                </div>
                <div className="text-primary-200 text-sm mt-1">
                  {t("landing.stats.satisfaction")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* AI-Powered Trading Assistant Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
              {t("landing.aiPowered")}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              {t("landing.aiAssistantTitle")}
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("landing.aiAssistantSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Trading Signals */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 group bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transform hover:-translate-y-2 transition-all border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Real-Time Trading Signals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive instant buy/sell signals powered by advanced machine
                learning algorithms analyzing market patterns, volume, and
                momentum indicators.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Entry & exit points
                </li>
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Confidence scores
                </li>
              </ul>
            </div>

            {/* Trade Plans */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 group bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transform hover:-translate-y-2 transition-all border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Personalized Trade Plans
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AI generates customized trading strategies based on your risk
                tolerance, capital, and goals. Get step-by-step execution plans
                for every trade.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Position sizing
                </li>
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stop-loss levels
                </li>
              </ul>
            </div>

            {/* Risk Alerts */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 group bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transform hover:-translate-y-2 transition-all border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Smart Risk Alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Stay protected with real-time risk monitoring. Get instant
                alerts when approaching daily loss limits or when market
                volatility spikes.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Drawdown warnings
                </li>
                <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Volatility alerts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live News Hub Section */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <span className="inline-block px-4 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-4">
                Stay Informed
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Live News Hub
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Never miss a market-moving event. Our AI curates and analyzes
                breaking news, earnings reports, and economic data in real-time.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Breaking News Alerts
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Instant notifications for market-impacting events
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Sentiment Analysis
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-powered market sentiment from news & social media
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Economic Calendar
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track important events and earnings dates
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 relative">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center mb-6">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></span>
                  <span className="text-sm font-medium">Live Feed</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-xs text-orange-200 mb-1">
                      2 min ago
                    </div>
                    <div className="font-medium">
                      Fed signals potential rate pause in upcoming meeting
                    </div>
                    <div className="text-sm text-orange-200 mt-1">
                      Bullish for equities
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-xs text-orange-200 mb-1">
                      15 min ago
                    </div>
                    <div className="font-medium">
                      AAPL beats earnings expectations by 12%
                    </div>
                    <div className="text-sm text-orange-200 mt-1">
                      Strong momentum signal
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-xs text-orange-200 mb-1">
                      32 min ago
                    </div>
                    <div className="font-medium">
                      Morocco market opens with IAM leading gains
                    </div>
                    <div className="text-sm text-orange-200 mt-1">
                      Regional opportunity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Zone Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <span className="inline-block px-4 py-1 bg-white/10 text-purple-200 rounded-full text-sm font-medium mb-4 backdrop-blur">
              Join the Tribe
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Community Zone
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Connect with thousands of traders, share strategies, and grow
              together. Trading doesn't have to be lonely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
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
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Discussion Forums
              </h3>
              <p className="text-purple-200">
                Engage in market discussions, share analysis, and debate trading
                ideas with peers.
              </p>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Trade Ideas</h3>
              <p className="text-purple-200">
                Browse and share trade setups. Learn from successful traders and
                refine your edge.
              </p>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Leaderboard Competitions
              </h3>
              <p className="text-purple-200">
                Compete monthly for top rankings. Earn recognition and showcase
                your trading skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MasterClass Learning Center Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 transform hover:-translate-y-2 transition-all border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    50+ Courses
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    From beginner to advanced
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 transform hover:-translate-y-2 transition-all mt-8 border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Strategy Labs
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Practice with real scenarios
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 transform hover:-translate-y-2 transition-all border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Expert Mentors
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Learn from the pros
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 transform hover:-translate-y-2 transition-all mt-8 border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
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
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Certifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Prove your expertise
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 order-1 lg:order-2">
              <span className="inline-block px-4 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium mb-4">
                Level Up
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                MasterClass Learning Center
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform from novice to expert with our comprehensive
                educational platform. Structured courses, live webinars, and
                hands-on practice.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-teal-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Technical Analysis Fundamentals
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-teal-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Risk Management Strategies
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-teal-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Psychology of Trading
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-teal-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Advanced Prop Firm Strategies
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Traders Choose TradeSense AI */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Traders Choose TradeSense AI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful traders who've transformed their
              trading journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Zero Risk Practice
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Master trading without risking real capital. Perfect your
                strategy risk-free.
              </p>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Real Market Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Trade with live prices from NYSE, NASDAQ, and Casablanca Stock
                Exchange.
              </p>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 text-sm">
                Get intelligent signals and analysis powered by machine
                learning.
              </p>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-400 text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Thriving Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect with 10,000+ traders. Learn, share, and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join TradeSense AI today and start your journey to becoming a
            confident, profitable trader. No risk, all reward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-700 bg-white rounded-xl shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              Start Trading Challenge
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
          <p className="mt-8 text-primary-200 text-sm flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Free demo account
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel anytime
            </span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/tradesense_logo.png"
                  alt="TradeSense Logo"
                  className="h-8 w-auto"
                />
                <h3 className="text-xl font-bold text-white">TradeSense AI</h3>
              </div>
              <p className="text-sm">
                Your intelligent trading companion. Master the markets with
                AI-powered insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="hover:text-white transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Risk Disclosure
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>
              © 2026 TradeSense AI. All rights reserved. Trading involves risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
