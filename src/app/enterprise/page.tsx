import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/marketing/page-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ShieldCheck, KeyRound, Building2, Headphones } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Compliance-Grade Audit Trail",
    description:
      "Every ledger mutation — collection, allocation, write-off, or reversal — is captured as an immutable, timestamped event ready for regulator review.",
  },
  {
    icon: KeyRound,
    title: "SSO & Role Policies",
    description:
      "SAML/OIDC single sign-on, custom role hierarchies down to the branch level, and field-level permissioning for sensitive member data.",
  },
  {
    icon: Building2,
    title: "Dedicated Infrastructure",
    description:
      "Isolated database tenancy per organization with regional data residency options and a contractual uptime SLA.",
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    description:
      "A named onboarding specialist during rollout, then 24/7 phone and chat coverage with sub-hour response for production incidents.",
  },
];

const stats = [
  { value: "99.95%", label: "Contractual uptime SLA" },
  { value: "256-bit", label: "Encryption at rest & in transit" },
  { value: "36+", label: "Branch tenants on largest deployment" },
  { value: "<1hr", label: "P1 incident response" },
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090B0A] dark:text-slate-100">
      <Navbar />

      <PageHeader
        eyebrow="Enterprise"
        title="Built for regulated micro-finance at scale"
        description="Regional NBFCs and multi-branch chit-fund operators run their entire back office on NexFix, with the audit trail, isolation, and support their compliance teams require."
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/70 sm:grid-cols-4 dark:border-[#1F2623] dark:bg-[#1F2623]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/90 px-6 py-8 text-center dark:bg-[#121614]"
              >
                <p className="text-3xl font-bold tabular-nums text-teal-700 dark:text-[#10B981]">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600 dark:text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-[#1F2623]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 dark:border-[#1F2623] dark:bg-[#121614]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-[#10B981] dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-[#1F2623]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Schedule an enterprise security & architecture review
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-neutral-400">
            Our engineering team will walk your risk committee through SOC-readiness, our tenancy model, and sample audit exports.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="mailto:enterprise@nexfix.io"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-bold text-black shadow-xs hover:bg-[#0EA57E] transition"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
