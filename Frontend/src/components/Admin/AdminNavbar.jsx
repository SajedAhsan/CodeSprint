export default function AdminNavbar({ currentSection, onSwitchSection, onExitAdmin, onNavigateBlog, onLogout }) {
  const sections = [
    { key: 'composer', label: 'Problem Composer' },
    { key: 'registry', label: 'Problem Registry' },
    { key: 'posts', label: 'Blog Manager' },
    { key: 'preview', label: 'Preview' },
  ]

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout()
    } else {
      localStorage.removeItem('codesprintToken')
      localStorage.removeItem('token')
      localStorage.removeItem('codesprintUsername')
      localStorage.removeItem('codesprintUserId')
      localStorage.removeItem('codesprintRole')
      localStorage.removeItem('codesprint_current_view')
      window.location.href = '/'
    }
  }

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
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-500 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:ring-offset-slate-950 active:scale-95 cursor-pointer"
            aria-label="Logout"
            title="Logout"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}