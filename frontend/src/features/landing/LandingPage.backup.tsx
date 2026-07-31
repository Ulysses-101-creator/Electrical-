export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070B12] text-white">
      {/* Navigation */}
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-sm font-semibold tracking-wide">
              ElectricQuote
            </span>
          </div>

          <nav className="hidden gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>

          <a
            href="/login"
            className="text-sm text-slate-300 hover:text-white"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-blue-400">
              Quoting system for electrical contractors
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Quotes that look professional,
              <br />
              get sent faster,
              <br />
              and win more work.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              Create detailed electrical quotes in minutes, manage customers,
              and track every job from one clean, professional workspace.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/register"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500"
              >
                Start free
              </a>

              <a
                href="#features"
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white"
              >
                See how it works
              </a>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-semibold">60 sec</p>
                <p className="mt-1 text-sm text-slate-500">
                  average quote creation
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold">R0</p>
                <p className="mt-1 text-sm text-slate-500">
                  setup cost
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold">100%</p>
                <p className="mt-1 text-sm text-slate-500">
                  mobile-friendly
                </p>
              </div>
            </div>
          </div>

          {/* Quote preview */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-[#0B111A] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Quote preview</p>
                  <p className="mt-1 font-medium">
                    DB board installation
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                  Ready to send
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">
                    Main DB replacement
                  </span>
                  <span>R8,500</span>
                </div>

                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">
                    Circuit testing
                  </span>
                  <span>R1,800</span>
                </div>

                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">
                    Materials
                  </span>
                  <span>R4,200</span>
                </div>

                <div className="flex justify-between pt-4 text-base font-semibold">
                  <span>Total (incl. VAT)</span>
                  <span className="text-blue-400">R16,675</span>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-400">Sent to customer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
