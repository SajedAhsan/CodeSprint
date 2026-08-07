export default function AdminNavbar({ currentSection, onSwitchSection, onExitAdmin, onNavigateBlog }) {
  const sections = [
    { key: 'composer', label: 'Problem Composer' },
    { key: 'registry', label: 'Problem Registry' },
    { key: 'posts', label: 'Post Manager' },
    { key: 'preview', label: 'Preview' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Admin Panel</p>
          <h1 className="mt-1 text-lg font-semibold text-white">Moderate problems and posts</h1>
        </div>

        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 lg:order-none lg:ml-6 lg:w-auto lg:flex-1 lg:justify-center lg:pb-0">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => onSwitchSection(section.key)}
              className={[
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                currentSection === section.key
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onExitAdmin}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to landing
          </button>
          <button
            type="button"
            onClick={onNavigateBlog}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Feed
          </button>
        </div>
      </div>
    </header>
  )
}