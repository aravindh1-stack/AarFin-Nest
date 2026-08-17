import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/marketing/page-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingTiers } from "@/components/marketing/pricing-tiers";

const faqs = [
  {
    question: "Can I mix scheme types on one plan?",
    answer:
      "Yes. Chit-Funds, Weekly Loans, and Daily Collections all run on the same ledger engine, so every plan supports all three scheme types out of the box.",
  },
  {
    question: "How is a 'branch tenant' counted?",
    answer:
      "Each isolated branch or franchise workspace with its own staff, routes, and reporting counts as one branch tenant, regardless of member count.",
  },
  {
    question: "Is there a setup or migration fee?",
    answer:
      "Growth and Enterprise plans include guided data migration from spreadsheets or legacy software at no extra cost.",
  },
  {
    question: "What happens if I exceed my collection volume?",
    answer:
      "We'll notify you before any limit impacts collections and help you move to the right tier — nothing is ever hard-capped mid-cycle.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <Navbar />

      <PageHeader
        eyebrow="Pricing"
        title="Straightforward pricing, per branch"
        description="No per-member fees, no surprise overages. Pick the tier that matches how many branches you run and how deep you need audit and automation to go."
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PricingTiers />
        </div>
      </section>

      <section className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-slate-800/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently asked
          </h2>
          <div className="mt-10 divide-y divide-slate-200/70 rounded-2xl border border-slate-200/80 bg-white/70 dark:divide-slate-800/50 dark:border-slate-800/50 dark:bg-[#121212]/70">
            {faqs.map((faq) => (
              <div key={faq.question} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
