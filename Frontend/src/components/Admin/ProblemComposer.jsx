export default function ProblemComposer({ problemForm, onChange, onSubmit, topics, isSubmitting = false, statusMessage = '', statusType = '' }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.18)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Problem composer</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Add a problem to a topic</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">Create a new problem, assign it to a specific topic, and keep the editor state aligned with the main problems page.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Topic</span>
            <select
              value={problemForm.topic}
              onChange={(event) => onChange('topic', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic} className="bg-slate-950">
                  {topic}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Difficulty</span>
            <select
              value={problemForm.difficulty}
              onChange={(event) => onChange('difficulty', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                <option key={difficulty} value={difficulty} className="bg-slate-950">
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Problem name</span>
          <input
            type="text"
            value={problemForm.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Binary tree ranges"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Concepts</span>
          <input
            type="text"
            value={problemForm.concept}
            onChange={(event) => onChange('concept', event.target.value)}
            placeholder="Tree DP, DFS"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Judge URL</span>
          <input
            type="url"
            value={problemForm.judgeUrl}
            onChange={(event) => onChange('judgeUrl', event.target.value)}
            placeholder="https://codeforces.com/problemset/problem/..."
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(problemForm.premium)}
            onChange={(event) => onChange('premium', event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
          />
          Mark as premium problem
        </label>

        {statusMessage ? (
          <p
            className={[
              'rounded-2xl border px-4 py-3 text-sm',
              statusType === 'success'
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                : 'border-rose-400/20 bg-rose-400/10 text-rose-200',
            ].join(' ')}
          >
            {statusMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
        >
          {isSubmitting ? 'Publishing...' : 'Publish problem'}
        </button>
      </form>
    </section>
  )
}