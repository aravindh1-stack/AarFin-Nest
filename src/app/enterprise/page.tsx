import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/marketing/page-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const pillars = [
  {
    icon: "🛡",
    title: "Compliance-Grade Audit Trail",
    description:
      "Every ledger mutation — collection, allocation, write-off, or reversal — is captured as an immutable, timestamped event ready for regulator review.",
  },
  {
    icon: "🔑",
    title: "SSO & Role Policies",
    description:
      "SAML/OIDC single sign-on, custom role hierarchies down to the branch level, and field-level permissioning for sensitive member data.",
  },
  {
    icon: "🏢",
    title: "Dedicated Infrastructure",
    description:
      "Isolated database tenancy per organization with regional data residency options and a contractual uptime SLA.",
  },
  {
    icon: "📞",
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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <Navbar />

      <PageHeader
        eyebrow="Enterprise"
        title="Built for regulated micro-finance at scale"
        description="Regional NBFCs and multi-branch chit-fund operators run their entire back office on NexFix, with the audit trail, isolation, and support their compliance teams require."
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/70 sm:grid-cols-4 dark:border-slate-800/50 dark:bg-slate-800/50">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/90 px-6 py-8 text-center dark:bg-[#121212]/90"
              >
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/50 dark:bg-[#121212]/70"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-xl dark:border-teal-400/20 dark:bg-teal-400/10">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-slate-800/50">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-700 to-emerald-800 px-8 py-14 text-center shadow-2xl shadow-teal-900/20">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Talk to our enterprise team
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-teal-50/90">
            Tell us about your branch network and compliance requirements —
            we&apos;ll put together a rollout plan and a dedicated
            environment for your organization.
          </p>
          <button
            type="button"
            className="mt-8 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow-lg transition hover:bg-teal-50"
          >
            Contact Sales
          </button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
