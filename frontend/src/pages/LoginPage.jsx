import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-noise opacity-15" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-primary-100 ring-1 ring-white/10 shadow-lg shadow-black/30 backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-base font-bold text-white shadow-md shadow-primary-500/30">
                TS
              </span>
              <span className="text-sm sm:text-base">TradeSense AI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-200 via-white to-purple-200 bg-clip-text text-transparent">
              {t("auth.signInTitle")}
            </h2>
            <p className="text-sm text-gray-300">
              {t("auth.or")}{" "}
              <Link
                to="/register"
                className="font-semibold text-primary-200 underline underline-offset-4 hover:text-white"
              >
                {t("auth.createAccount")}
              </Link>
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-inner shadow-red-900/40">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-200">
                  {t("auth.email")}
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
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
                          d="M16 12H8m0 0l4-4m-4 4l4 4m-7-8V7a2 2 0 012-2h8a2 2 0 012 2v2m-2 9H7a2 2 0 01-2-2V9"
                        />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white placeholder:text-gray-400 shadow-inner shadow-black/40 focus:border-primary-400 focus:outline-none"
                      placeholder={t("auth.email")}
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium text-gray-200">
                  {t("auth.password")}
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
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
                          d="M12 11c1.105 0 2-.895 2-2 0-1.106-.895-2-2-2s-2 .894-2 2c0 1.105.895 2 2 2zm0 0v4m-6 4h12a2 2 0 002-2v-4a8 8 0 10-16 0v4a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white placeholder:text-gray-400 shadow-inner shadow-black/40 focus:border-primary-400 focus:outline-none"
                      placeholder={t("auth.password")}
                    />
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-80"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.376 0 0 5.376 0 12h4z"
                      />
                    </svg>
                    {t("auth.signingIn")}
                  </span>
                ) : (
                  t("auth.signIn")
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                {t("auth.termsAgreement")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
