"use client";

import { useState } from "react";

type Cycle = "monthly" | "annual";

const tiers = [
  {
    name: "Starter",
    description: "For a single branch getting off spreadsheets.",
    monthly: 4999,
    annual: 3999,
    highlight: false,
    cta: "Start Free Trial",
    features: [
      "1 branch tenant",
      "Up to 5 collection routes",
      "Chit-Funds + Weekly Loans",
      "Atomic FIFO ledger",
      "Email support",
    ],
  },
  {
    name: "Growth",
    description: "For multi-branch operators scaling collections.",
    monthly: 12999,
    annual: 10499,
    highlight: true,
    cta: "Start Free Trial",
    features: [
      "Up to 10 branch tenants",
      "Unlimited collection routes",
      "All scheme types",
      "Live telemetry dashboards",
      "Guided data migration",
      "Priority support (12hr SLA)",
    ],
  },
  {
    name: "Enterprise",
    description: "For regional NBFCs with compliance needs.",
    monthly: null,
    annual: null,
    highlight: false,
    cta: "Talk to Sales",
    features: [
      "Unlimited branch tenants",
      "Dedicated compliance audit trail",
      "SSO & custom role policies",
      "Uptime SLA & dedicated infra",
      "Onboarding specialist",
      "24/7 phone support",
    ],
  },
];

export function PricingTiers() {
  const [cycle, setCycle] = useState<Cycle>("annual");

  return (
    <div>
      <div className="mx-auto mb-12 flex w-fit items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 dark:border-slate-800/50 dark:bg-[#121212]/70">
        {(["monthly", "annual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCycle(option)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
              cycle === option
                ? "bg-teal-700 text-white shadow-md shadow-teal-700/25 dark:bg-teal-600"
                : "text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
            }`}
          >
            {option}
            {option === "annual" && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  cycle === option
                    ? "bg-white/20 text-white"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                -20%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = tier[cycle];
          return (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl p-7 ${
                tier.highlight
                  ? "border-2 border-teal-500/50 bg-white shadow-2xl shadow-teal-500/10 dark:bg-[#121212]"
                  : "border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md dark:bg-teal-600">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {tier.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                {price === null ? (
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      /branch/mo
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tier.highlight
                    ? "bg-teal-700 text-white shadow-lg shadow-teal-700/25 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"
                    : "border border-slate-300 text-slate-800 hover:border-teal-500/50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500/50 dark:hover:text-teal-300"
                }`}
              >
                {tier.cta}
              </button>

              <ul className="mt-7 space-y-3 border-t border-slate-200/70 pt-6 dark:border-slate-800/50">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0L3.3 9.5a1 1 0 1 1 1.4-1.4l3.9 3.9 6.7-6.7a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
