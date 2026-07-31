export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500" />
          <span className="text-lg font-bold">VoltQuote AI</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#how">How it works</a>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500">
          Start free trial
        </button>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              AI quoting software for electrical contractors
            </p>

            <h1 className="text-5xl font-extrabold leading-tight lg:text-6xl">
              Generate professional electrical quotes in
              <span className="text-blue-400"> under 60 seconds.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-400">
              Win more jobs, send quotes faster, and manage your electrical business from one platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-500">
                Start free trial
              </button>

              <button className="rounded-xl border border-slate-700 px-6 py-4 font-semibold text-slate-300 hover:border-blue-500 hover:text-white">
                Watch demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold">VoltQuote Dashboard</h3>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Quotes this week</p>
                <p className="mt-2 text-3xl font-bold">24</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Acceptance rate</p>
                <p className="mt-2 text-3xl font-bold text-green-400">68%</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Quoted value</p>
                <p className="mt-2 text-3xl font-bold">R187k</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Active customers</p>
                <p className="mt-2 text-3xl font-bold">56</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
