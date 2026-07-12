export default function FeaturesSection({ features, onFeatureSelect }) {
  return (
    <section id="features" className="w-full rounded-[28px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(74,106,156,0.12)] backdrop-blur-md sm:p-7 lg:p-8">
      <div className="max-w-4xl">
        <span className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Why CodeSprint?</span>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">Everything you need to learn without leaving the page.</h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            className={`rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(58,94,146,0.1)] transition-transform hover:-translate-y-0.5 ${
              onFeatureSelect ? 'cursor-pointer' : ''
            }`}
            key={feature.key}
            role={typeof onFeatureSelect === 'function' ? 'button' : undefined}
            tabIndex={typeof onFeatureSelect === 'function' ? 0 : undefined}
            onClick={() => onFeatureSelect?.(feature.key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onFeatureSelect?.(feature.key)
              }
            }}
          >
            <img className="mb-4 h-auto w-full max-h-32 object-contain" src={feature.image} alt="" aria-hidden="true" />
            <h3 className="mb-2 text-xl font-semibold text-slate-950">{feature.title}</h3>
            <p className="text-base leading-6 text-slate-600">{feature.copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}