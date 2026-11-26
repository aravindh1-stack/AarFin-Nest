"use client";

import { useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Check, CheckCircle2, X, Download, CreditCard, Sparkles } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING";
  plan: string;
  invoiceNo: string;
}

const mockInvoices: Invoice[] = [
  { id: "inv-1", invoiceNo: "NF-INV-2026-11", date: "2026-11-01", amount: 4999, status: "PAID", plan: "Growth Tier (Monthly)" },
  { id: "inv-2", invoiceNo: "NF-INV-2026-10", date: "2026-10-01", amount: 4999, status: "PAID", plan: "Growth Tier (Monthly)" },
  { id: "inv-3", invoiceNo: "NF-INV-2026-09", date: "2026-09-01", amount: 4999, status: "PAID", plan: "Growth Tier (Monthly)" },
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [activePlan, setActivePlan] = useState<"STARTER" | "GROWTH" | "ENTERPRISE">("GROWTH");
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  const plans = [
    {
      id: "STARTER" as const,
      name: "Starter FinTech",
      priceMonthly: 1999,
      priceAnnually: 1599,
      description: "Ideal for single-branch micro-credit agencies and local chits.",
      features: [
        "1 Branch Tenant",
        "Up to 2 Field Collection Officers",
        "Up to 500 Active Members",
        "Basic Daily / Weekly Schedules",
        "Standard PDF Reports",
      ],
      quotaBranches: "1 Branch",
      quotaSeats: "2 Agents",
    },
    {
      id: "GROWTH" as const,
      name: "Growth Multi-Branch",
      priceMonthly: 4999,
      priceAnnually: 3999,
      description: "High-volume field operations with automated WhatsApp receipts & EOD reconciliation.",
      features: [
        "Up to 5 Branch Tenants",
        "Up to 10 Field Collection Officers",
        "Up to 5,000 Active Members",
        "Chit Fund Auction & Dividend Engine",
        "EOD Cash Desk Reconciliation",
        "Automated WhatsApp & Thermal Printing",
        "Priority Email & Chat Support",
      ],
      quotaBranches: "5 Branches",
      quotaSeats: "10 Agents",
      popular: true,
    },
    {
      id: "ENTERPRISE" as const,
      name: "Enterprise NBFC / Cooperative",
      priceMonthly: 12999,
      priceAnnually: 10499,
      description: "Dedicated infrastructure, custom API hooks, white-labeling, and custom audit compliance.",
      features: [
        "Unlimited Branch Tenants",
        "Unlimited Field Agents & Officers",
        "Unlimited Active Members",
        "Dedicated Isolated PostgreSQL Database",
        "White-label Branding & Custom Domain",
        "Regulatory CIBIL & GST Auto-filing APIs",
        "24/7 Dedicated Account Manager",
      ],
      quotaBranches: "Unlimited",
      quotaSeats: "Unlimited",
    },
  ];

  return (
    <div className="min-h-screen">
      <DashboardTopbar
        title="SaaS Subscription & Organization Billing"
        description="Manage plan tiers, active field agent seats, usage meters, and billing invoices"
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Notification Toast */}
        {upgradeSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{upgradeSuccess}</span>
            </div>
            <button type="button" onClick={() => setUpgradeSuccess(null)} className="font-bold cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Current Subscription Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-[#202425] dark:bg-[#121518] relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Current Plan</span>
                <span className="bg-emerald-500/15 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full dark:text-emerald-400">
                  ACTIVE • AUTO-RENEWS
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Growth Multi-Branch Tier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Next billing invoice: <strong className="text-slate-700 dark:text-slate-200">26 December 2026</strong> • Payment method: <strong className="font-mono text-slate-700 dark:text-slate-200">HDFC Corporate Card (•••• 4291)</strong>
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">₹4,999</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Field Officer Seats</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">4 / 10 Used</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: "40%" }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">6 seats remaining</div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Branch Tenants</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">3 / 5 Active</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "60%" }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">2 branches remaining</div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active Member Directory</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">1,842 / 5,000</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: "36.8%" }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">3,158 member capacity free</div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Collection Volume</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹24.8L / ₹50.0L</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "49.6%" }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">50.4% volume quota free</div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers & Upgrade Switcher */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Scale Your Microfinance Business
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Upgrade your organization plan as you expand to more routes, field agents, and regional divisions.
            </p>

            {/* Monthly / Annually Toggle */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold mt-2">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-4 py-1.5 transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-[#121518] dark:text-white font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annually")}
                className={`rounded-lg px-4 py-1.5 transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annually"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-[#121518] dark:text-white font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-bold">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = activePlan === plan.id;
              const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between transition relative ${
                    plan.popular
                      ? "border-teal-500/50 bg-teal-500/5 dark:border-teal-400/40 dark:bg-teal-500/5 shadow-lg shadow-teal-500/5"
                      : "border-slate-200/90 bg-white dark:border-[#202425] dark:bg-[#121518]"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Recommended
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 font-bold" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        setActivePlan(plan.id);
                        setUpgradeSuccess(`Plan changed to ${plan.name} successfully.`);
                      }}
                      className={`w-full rounded-xl py-2.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                        isCurrent
                          ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 cursor-default"
                          : plan.popular
                          ? "bg-teal-600 text-white hover:bg-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                          : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      }`}
                    >
                      {isCurrent ? "Current Active Plan" : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice History Table */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-[#202425] dark:bg-[#121518] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Billing Invoice History</h3>
              <p className="text-xs text-slate-500">Tax invoices and GST statements for accounting</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">GSTIN: 33AAACF2026M1Z8</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {mockInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNo}</div>
                  <div className="text-[11px] text-slate-500">{inv.plan} • Billed on {inv.date}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{inv.amount.toLocaleString("en-IN")}</span>
                  <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full dark:text-emerald-400">
                    PAID
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
