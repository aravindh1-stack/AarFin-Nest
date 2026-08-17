const highlights = [
  "Atomic FIFO ledger across every scheme",
  "Real-time collection telemetry",
  "Multi-branch, role-based access",
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-teal-800 via-teal-900 to-[#000000] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
          <span className="text-sm font-bold text-white">N</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          NexFix
        </span>
      </div>

      <div className="relative">
        <blockquote className="text-2xl font-semibold leading-snug text-white">
          &ldquo;We closed our daily cash-up in minutes instead of
          hours — across 36 branches.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-teal-100/80">
          Operations Head, Regional Chit-Fund Network
        </p>

        <div className="mt-10 space-y-3 border-t border-white/10 pt-8">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 shrink-0 text-teal-300"
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0L3.3 9.5a1 1 0 1 1 1.4-1.4l3.9 3.9 6.7-6.7a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-teal-50/90">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-teal-100/50">
        © {new Date().getFullYear()} NexFix. Enterprise Micro-Finance SaaS
        OS.
      </p>
    </div>
  );
}
