export default function FooterSection() {
  return (
    <footer className="w-full rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-[0_24px_70px_rgba(74,106,156,0.12)] backdrop-blur-md">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Code<span className="text-blue-600">Sprint</span>
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Master Coding. Accelerate Learning.
            <br />
            Solve problems, watch video solutions, participate in
            discussions, and prepare for coding interviews—all in one
            place.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Links
          </h3>

          <nav className="flex flex-col gap-3 text-sm">
            <a className="transition hover:text-blue-600" href="#home">
              Home
            </a>
            <a className="transition hover:text-blue-600" href="#features">
              Features
            </a>
            <a className="transition hover:text-blue-600" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-blue-600" href="#community">
              Community
            </a>
            <a className="transition hover:text-blue-600" href="#blog">
              Blog
            </a>
          </nav>
        </div>

        {/* Platform */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Platform
          </h3>

          <ul className="space-y-3 text-sm text-slate-600">
            <li>💻 10,000+ Coding Problems</li>
            <li>🎥 Video Solutions</li>
            <li>💬 Community Discussions</li>
            <li>🏆 Weekly Challenges</li>
            <li>⭐ Premium Learning</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row">
        <p>© 2026 CodeSprint. All rights reserved.</p>

        <div className="flex gap-6">
          <a className="transition hover:text-blue-600" href="#">
            Privacy
          </a>
          <a className="transition hover:text-blue-600" href="#">
            Terms
          </a>
          <a className="transition hover:text-blue-600" href="#">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}