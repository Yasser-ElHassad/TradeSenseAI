import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { challengesService } from "../services/challenges";

const plans = [
  {
    name: "Starter",
    price: 200,
    currency: "DH",
    balance: 5000,
    balanceFormatted: "$5,000",
    features: [
      "Starting Balance: $5,000",
      "5% Daily Loss Limit",
      "10% Max Total Loss",
      "10% Profit Target",
      "Unlimited Trading Days",
      "All Markets Access",
    ],
    popular: false,
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Pro",
    price: 500,
    currency: "DH",
    balance: 10000,
    balanceFormatted: "$10,000",
    features: [
      "Starting Balance: $10,000",
      "5% Daily Loss Limit",
      "10% Max Total Loss",
      "10% Profit Target",
      "Unlimited Trading Days",
      "All Markets Access",
      "Priority Support",
    ],
    popular: true,
    color: "from-purple-400 to-purple-600",
  },
  {
    name: "Elite",
    price: 1000,
    currency: "DH",
    balance: 25000,
    balanceFormatted: "$25,000",
    features: [
      "Starting Balance: $25,000",
      "5% Daily Loss Limit",
      "10% Max Total Loss",
      "10% Profit Target",
      "Unlimited Trading Days",
      "All Markets Access",
      "Priority Support",
      "Performance Analytics",
      "1-on-1 Mentorship",
    ],
    popular: false,
    color: "from-orange-400 to-orange-600",
  },
];

const PaymentModal = ({ isOpen, onClose, plan, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("cmi");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  if (!isOpen || !plan) return null;

  const tabs = [
    { id: "cmi", name: "CMI", icon: "card" },
    { id: "crypto", name: "Crypto", icon: "crypto" },
    { id: "paypal", name: "PayPal", icon: "paypal" },
  ];

  const renderIcon = (iconType) => {
    switch (iconType) {
      case "card":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case "crypto":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "paypal":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.753 1.738 1.343 4.678-.608 7.264-.989 1.311-2.463 2.307-4.28 2.883.065-.019.13-.037.196-.058 2.704-.839 5.407-3.399 5.299-9.548zm-9.793 5.9h1.947c3.612 0 6.545-1.467 7.43-5.98.77-3.93-1.442-5.9-5.232-5.9H8.677c-.524 0-.968.382-1.05.9L5.05 16.806c-.082.518.292.94.814.94h3.274l1.21-5.928c.062-.307.296-.534.595-.535l.486.001z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await onSuccess(plan);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-gray-900/80 dark:shadow-black/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-10 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-gray-600 shadow-md transition hover:scale-105 hover:text-gray-900 dark:bg-gray-800/70 dark:text-gray-300"
          aria-label="Close payment modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_1fr] md:px-8 md:py-8 relative">
          <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-gray-800/70">
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} text-white shadow-lg`}
            >
              <span className="text-xl font-bold">{plan.name[0]}</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {plan.name} Challenge
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {plan.balanceFormatted} Virtual Capital
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              <span className="pb-2 text-lg font-medium text-gray-500 dark:text-gray-300">
                {plan.currency}
              </span>
            </div>

            <div className="mt-6 grid gap-3 rounded-xl border border-gray-200/70 bg-gray-50/60 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
              {plan.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex rounded-xl border border-white/20 bg-white/70 p-1 backdrop-blur-lg dark:border-white/10 dark:bg-gray-800/70">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-white shadow-lg dark:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {renderIcon(tab.icon)}
                  {tab.name}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {activeTab === "cmi" && (
                <div className="space-y-4 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-gray-800/80">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Secured by CMI Morocco
                  </div>
                </div>
              )}

              {activeTab === "crypto" && (
                <div className="space-y-4 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-gray-800/80">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Send payment to:
                    </p>
                    <div className="rounded border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                      0x1234...ABCD5678...EFGH
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      USDT (TRC20) or BTC
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Your Wallet Address (for refunds)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your wallet address"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    <span className="text-lg">⏳</span>
                    Payment verified within 10 minutes
                  </div>
                </div>
              )}

              {activeTab === "paypal" && (
                <div className="space-y-4 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-gray-800/80">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      PayPal Email
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    PayPal Buyer Protection
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className={`group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${plan.color} px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {processing ? (
                  <>
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
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${plan.price} ${plan.currency}`
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  SSL Secured
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  PCI Compliant
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const highlightList = useMemo(
    () => [
      {
        title: "Risk Controls",
        desc: "Daily & max loss rules baked in to build discipline",
        icon: (
          <svg
            className="w-5 h-5 text-primary-600 dark:text-primary-400"
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
        ),
      },
      {
        title: "Multi-Market",
        desc: "Trade NASDAQ, Crypto, and Casablanca from one place",
        icon: (
          <svg
            className="w-5 h-5 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "No Time Limits",
        desc: "Unlimited trading days so you can grow at your pace",
        icon: (
          <svg
            className="w-5 h-5 text-primary-600 dark:text-primary-400"
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
        ),
      },
      {
        title: "Always-on Support",
        desc: "Priority help for Pro & Elite challengers",
        icon: (
          <svg
            className="w-5 h-5 text-primary-600 dark:text-primary-400"
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
        ),
      },
    ],
    [],
  );

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/pricing" } } });
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePaymentSuccess = async (plan) => {
    try {
      // Create the challenge in the backend
      const response = await challengesService.createChallenge(plan.name);
      console.log("Challenge created:", response);
      setShowModal(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create challenge:", error);
      setShowModal(false);
      // If challenge already exists, just go to dashboard
      if (error.response?.status === 409) {
        navigate("/dashboard");
      } else {
        alert(error.response?.data?.error || "Failed to create challenge. Please try again.");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-30" />
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -right-16 top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800">
            {t("pricing.title")}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("pricing.subtitle")}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t("pricing.description")}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-gray-600 shadow ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:text-gray-200 dark:ring-gray-700">
            <svg
              className="w-5 h-5 text-primary-500"
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
            Start a challenge, trade all markets, and climb the leaderboard.
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlightList.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/30 p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800/80 dark:ring-gray-700">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-1 shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-gray-900/70 ${
                plan.popular ? "ring-4 ring-primary-500/40" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                  Most Popular
                </div>
              )}

              <div className="rounded-[22px] border border-gray-100/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.color} text-white shadow-lg`}
                  >
                    <span className="text-xl font-bold">{plan.name[0]}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Virtual Balance
                    </p>
                    <p
                      className={`text-lg font-semibold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                    >
                      {plan.balanceFormatted}
                    </p>
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-lg font-medium text-gray-500 dark:text-gray-300">
                    {plan.currency}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                        <svg
                          className="w-3 h-3 text-green-600 dark:text-green-200"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-8 w-full rounded-2xl px-6 py-4 text-lg font-bold transition ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl`
                      : "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  }`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison strip */}
        <div className="mt-12 grid gap-4 rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
              What you get
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Challenge benefits across all plans
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build consistency with realistic risk rules and unlock higher
              tiers as you pass targets.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <svg
                className="w-5 h-5 text-primary-500 flex-shrink-0"
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
              Real-time P/L tracking & progress to target
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <svg
                className="w-5 h-5 text-primary-500 flex-shrink-0"
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
              Daily & overall loss guardrails enforced
            </div>
          </div>
          <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <svg
                className="w-5 h-5 text-primary-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Access to NASDAQ, Crypto, and Moroccan markets
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <svg
                className="w-5 h-5 text-primary-500 flex-shrink-0"
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
              Eligible for monthly leaderboard spotlight
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {[
            {
              q: "What happens if I pass?",
              a: "Upon passing the challenge, you'll receive a certificate and be featured on our leaderboard. This simulates earning a funded account.",
            },
            {
              q: "Can I retry if I fail?",
              a: "Yes! You can purchase a new challenge anytime. Use your experience to improve and try again.",
            },
            {
              q: "What markets can I trade?",
              a: "Trade stocks from international markets (NYSE, NASDAQ) and the Moroccan Casablanca Stock Exchange.",
            },
            {
              q: "Is there a time limit?",
              a: "No time limit! Take as long as you need to reach the profit target while respecting the loss limits.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl border border-white/30 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.q}
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-8 text-center shadow-xl dark:border-emerald-800/60 dark:from-emerald-900/40 dark:to-green-900/30">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            100% Money Back Guarantee
          </h3>
          <p className="max-w-2xl text-sm text-gray-700 dark:text-gray-300">
            Not satisfied? Get a full refund within 24 hours if you haven&apos;t
            made any trades.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 backdrop-blur dark:bg-emerald-900/50 dark:text-emerald-100 dark:ring-emerald-800">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Refunds processed instantly
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plan={selectedPlan}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PricingPage;
