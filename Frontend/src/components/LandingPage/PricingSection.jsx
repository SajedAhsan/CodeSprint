export default function PricingSection({ features, onPremiumClick }) {
  return (
    <section id="pricing" className="w-full rounded-[28px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(74,106,156,0.12)] backdrop-blur-md sm:p-7 lg:p-8">
      <div className="max-w-4xl">
        <span className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Level Up</span>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">Choose the plan that matches your pace.</h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(58,94,146,0.1)]">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Free</p>
          <ul className="mb-4 grid gap-3 p-0 list-none">
            {features.map((item) => (
              <li className="text-slate-600 before:mr-2 before:font-bold before:text-blue-500 before:content-['✓']" key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" className="min-h-12 w-full rounded-full bg-blue-50 px-6 font-semibold text-blue-700 transition-transform hover:-translate-y-0.5">
            Continue Free
          </button>
        </article>

        <article className="rounded-[24px] border border-blue-200/80 bg-gradient-to-b from-sky-50 to-sky-100 p-5 shadow-[0_16px_34px_rgba(58,94,146,0.1)]">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Premium</p>
          <ul className="mb-4 grid gap-3 p-0 list-none">
            {features.map((item) => (
              <li className="text-slate-600 before:mr-2 before:font-bold before:text-blue-500 before:content-['✓']" key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" className="min-h-12 w-full rounded-full bg-gradient-to-b from-sky-500 to-blue-700 px-6 font-semibold text-white shadow-[0_16px_30px_rgba(18,118,223,0.32),0_0_26px_rgba(30,144,255,0.24)] transition-transform hover:-translate-y-0.5" onClick={onPremiumClick}>
            Go Premium
          </button>
        </article>
      </div>
    </section>
  )
}