import logoImg from '../../assets/LandingPage/Logo.png'

function IconButton({ label, children, highlight = false, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition',
        highlight
          ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm hover:border-blue-300'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function BlogNavbar({ currentView = 'blog', onNavigateBlog, onNavigateProblems, onNavigatePostBlog, onNavigateProfile, onNavigateRoadmap }) {
  const navItems = [
    { key: 'blog', label: 'Blog', onClick: onNavigateBlog },
    { key: 'problems', label: 'Problems', onClick: onNavigateProblems },
    { key: 'roadmap', label: 'Roadmap', onClick: onNavigateRoadmap },
    { key: 'post-blog', label: 'Post Blog', onClick: onNavigatePostBlog },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap lg:px-8">
        {/* Logo */}
        <button
          type="button"
          className="flex shrink-0 items-center"
        >
          <img
            src={logoImg}
            alt="CodeSprint"
            className="h-12 w-auto object-contain"
          />
        </button>

        {/* Navigation */}
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 lg:order-none lg:ml-6 lg:w-auto lg:flex-1 lg:justify-center lg:pb-0">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={[
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                currentView === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <IconButton label="Notifications">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M15 17H5l1.2-1.8a4 4 0 0 0 .8-2.4V10a5 5 0 1 1 10 0v2.8a4 4 0 0 0 .8 2.4L19 17h-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 19a1.5 1.5 0 0 0 3 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>

          <IconButton label="Profile" onClick={onNavigateProfile}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 19a7 7 0 0 1 14 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span className="hidden sm:inline">Premium</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-white/90" />
          </button>
        </div>
      </div>
    </header>
  )
}