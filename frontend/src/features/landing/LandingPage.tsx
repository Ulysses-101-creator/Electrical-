
import { Link } from "react-router-dom";

const steps = [
  {
    idx: "01",
    title: "Describe the job",
    body: "Type what you're doing in plain language. It's broken into labor, materials, and callout lines automatically.",
  },
  {
    idx: "02",
    title: "Check the numbers",
    body: "Every line is editable before anything goes out. Adjust quantities, rates, add your own items.",
  },
  {
    idx: "03",
    title: "Send, get a decision",
    body: "One tap sends it to WhatsApp. The customer accepts or declines right there, no back and forth.",
  },
];

const features = [
  "Unlimited quotes",
  "WhatsApp & PDF sending",
  "Customer & job history",
  "Built fully for mobile",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 antialiased">
      <nav className="py-6">
        <div className="mx-auto flex max-w-[980px] items-center justify-between px-6">
          <span className="text-[15px] font-bold">ElectricQuote TEST123</span>
          <div className="flex items-center gap-8">
            <a
              href="#how"
              className="hidden text-[13.5px] font-medium text-neutral-500 no-underline sm:inline"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hidden text-[13.5px] font-medium text-neutral-500 no-underline sm:inline"
            >
              Pricing
            </a>
            <Link to="/login" className="text-[13.5px] font-medium text-neutral-100">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[980px] px-6">
        {/* Hero */}
        <div className="pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-neutral-500 sm:mb-7">
            For South African electrical contractors
          </div>
          <h1 className="mb-7 max-w-[760px] text-[34px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[68px] sm:leading-[1.02]">
            Quote the job <em className="italic-none text-neutral-500 not-italic">before you leave</em> the
            site.
          </h1>
          <p className="mb-10 max-w-[480px] text-base leading-relaxed text-neutral-500 sm:text-lg">
            Build a professional, itemized quote on your phone in under a minute. Send it to
            WhatsApp before you've even packed up the van.
          </p>
          <div className="mb-16 flex flex-wrap items-center gap-5 sm:mb-24">
            <Link
              to="/register"
              className="rounded-lg bg-neutral-100 px-6 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a]"
            >
              Start free trial
            </Link>
            <a href="#how" className="flex items-center gap-1.5 text-[14.5px] font-medium text-neutral-100">
              See how it works &rarr;
            </a>
          </div>

          {/* Quote artifact */}
          <div className="max-w-[640px] overflow-hidden rounded-xl border border-neutral-900 bg-[#0f0f0f] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-neutral-900 px-5 py-3.5 sm:px-[22px]">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-neutral-700" />
                <span className="h-2 w-2 rounded-full bg-neutral-700" />
                <span className="h-2 w-2 rounded-full bg-neutral-700" />
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#e8492c]">
                Sent
              </div>
            </div>
            <div className="px-6 py-7 sm:px-[26px]">
              <div className="mb-1 text-[15px] font-semibold">DB board install &mdash; Bob</div>
              <div className="mb-6 text-[12.5px] text-neutral-500">Kitchen rewire, 4 outlets</div>

              <div className="flex justify-between border-b border-neutral-900 py-[11px] text-[13.5px]">
                <span>Consumer unit replacement</span>
                <span className="font-mono text-[13px] text-neutral-500">R2,500.00</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 py-[11px] text-[13.5px]">
                <span>4&times; socket outlets</span>
                <span className="font-mono text-[13px] text-neutral-500">R1,800.00</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 py-[11px] text-[13.5px]">
                <span>Materials &amp; cabling</span>
                <span className="font-mono text-[13px] text-neutral-500">R3,310.00</span>
              </div>

              <div className="mt-5 flex items-baseline justify-between pt-1">
                <span className="text-[13px] text-neutral-500">Total, incl. VAT</span>
                <span className="font-mono text-[22px] font-semibold">R10,706.50</span>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section id="how" className="border-t border-neutral-900 py-12 sm:py-[70px]">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.1em] text-neutral-500">
            How it works
          </div>
          <h2 className="mb-8 max-w-[520px] text-[26px] font-bold tracking-[-0.02em] sm:mb-12 sm:text-[32px]">
            Three steps. No laptop.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
            {steps.map((step) => (
              <div key={step.idx}>
                <div className="mb-3.5 font-mono text-xs text-[#e8492c]">{step.idx}</div>
                <h3 className="mb-2.5 text-[17px] font-semibold">{step.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-neutral-500">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-neutral-900 py-12 sm:py-[70px]">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.1em] text-neutral-500">
            Pricing
          </div>
          <h2 className="mb-8 max-w-[520px] text-[26px] font-bold tracking-[-0.02em] sm:mb-12 sm:text-[32px]">
            One price. Everything included.
          </h2>
          <div className="mb-2 flex items-end gap-3.5">
            <span className="text-[44px] font-bold tracking-[-0.02em] sm:text-[56px]">R299</span>
            <span className="pb-2.5 text-[15px] text-neutral-500">/ month</span>
          </div>
          <div className="mb-9 text-sm text-neutral-500">
            14-day free trial &middot; no card required to start
          </div>
          <ul className="mb-11 grid max-w-[560px] grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-10">
            {features.map((feature) => (
              <li key={feature} className="relative pl-[18px] text-sm text-neutral-100">
                <span className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full bg-[#e8492c]" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="inline-block rounded-lg bg-neutral-100 px-6 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a]"
          >
            Start your free trial
          </Link>
        </section>

        {/* Honest section */}
        <section className="border-t border-neutral-900 py-12 sm:py-[70px]">
          <div className="max-w-[560px]">
            <p className="text-[15.5px] leading-relaxed text-neutral-500">
              <strong className="font-semibold text-neutral-100">This just launched.</strong> I&apos;m
              building ElectricQuote AI based on what real contractors actually need, not guesswork.
            </p>
            <p className="mt-4 text-[15.5px] leading-relaxed text-neutral-500">
              If you try it, I&apos;ll personally help you get set up. Your feedback shapes what
              gets built next &mdash; you won&apos;t be lost in a queue.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-neutral-900 py-12 pb-20 sm:py-[70px] sm:pb-24">
          <h2 className="mb-4 max-w-[520px] text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">
            Stop losing jobs to slow quotes.
          </h2>
          <p className="mb-8 max-w-[420px] text-base text-neutral-500">
            Free for 14 days. Cancel anytime.
          </p>
          <Link
            to="/register"
            className="inline-block rounded-lg bg-neutral-100 px-6 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a]"
          >
            Start free trial
          </Link>
        </section>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-neutral-900 py-7 font-mono text-[11.5px] text-neutral-700">
          <span>&copy; 2026 ElectricQuote</span>
          <span>Built for South African electrical contractors</span>
        </footer>
      </div>
    </div>
  );
}

EO
