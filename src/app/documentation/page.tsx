import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/marketing/site-footer";

const docSections = [
  {
    heading: "Getting Started",
    links: ["Introduction", "Creating a branch tenant", "Inviting agents"],
  },
  {
    heading: "Ledger & Payments",
    links: [
      "Atomic FIFO allocation",
      "Recording a collection",
      "Handling advance payments",
    ],
  },
  {
    heading: "Schemes",
    links: ["Chit-Fund auctions", "Weekly loan grids", "Daily collections"],
  },
  {
    heading: "API Reference",
    links: ["Authentication", "Members", "Installments", "Webhooks"],
  },
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <Navbar />

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200/70 px-6 py-10 lg:block dark:border-slate-800/50">
          <nav className="space-y-8">
            {docSections.map((section) => (
              <div key={section.heading}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {section.heading}
                </p>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link, idx) => (
                    <li key={link}>
                      <a
                        href="#"
                        className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                          section.heading === "Ledger & Payments" && idx === 0
                            ? "bg-teal-500/10 font-semibold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 flex-1 px-4 py-12 sm:px-8 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Ledger & Payments
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Atomic FIFO allocation
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Every payment recorded against a member is allocated to their
            oldest open installment first, across every scheme they hold.
            Allocation is atomic — either the full ledger transaction
            commits, or none of it does, so partial writes can never corrupt
            a member&apos;s balance.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-3 dark:border-slate-800/50">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                POST /v1/collections
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                200 OK
              </span>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
{`{
  "member_id": "mem_8842019",
  "amount": 500000,
  "currency": "INR",
  "route_id": "rt_north_a",
  "allocation": "fifo_auto"
}`}
            </pre>
          </div>

          <h2 className="mt-10 text-xl font-bold text-slate-900 dark:text-white">
            Allocation order
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            When <code className="rounded bg-slate-100 px-1.5 py-0.5 text-teal-700 dark:bg-white/10 dark:text-teal-300">allocation</code> is set to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-teal-700 dark:bg-white/10 dark:text-teal-300">fifo_auto</code>, the ledger walks a member&apos;s open installments oldest-first:
          </p>
          <ol className="mt-4 max-w-2xl space-y-3">
            {[
              "Overdue installments across all held schemes, oldest due date first",
              "The current cycle's installment, if not yet fully paid",
              "Any remainder is held as a credited advance against the next cycle",
            ].map((step, idx) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-4 text-sm text-slate-700 dark:border-slate-800/50 dark:bg-white/[0.02] dark:text-slate-300"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
