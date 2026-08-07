export default function PostManager({ postForm, onChange, onSubmit, postQuery, onChangeQuery, filteredPosts, onDeletePost }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.18)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Post manager</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Delete or add posts</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">The blog feed now shares state with the admin screen, so deleting a post removes it from the user feed too.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Post title</span>
          <input
            type="text"
            value={postForm.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="How to design a clean admin workflow"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Author</span>
          <input
            type="text"
            value={postForm.author}
            onChange={(event) => onChange('author', event.target.value)}
            placeholder="Admin"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Body</span>
          <textarea
            rows="7"
            value={postForm.body}
            onChange={(event) => onChange('body', event.target.value)}
            placeholder="Write each paragraph on a new line"
            className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Publish post
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Recent posts</p>
          <input
            type="search"
            value={postQuery}
            onChange={(event) => onChangeQuery(event.target.value)}
            placeholder="Search posts"
            className="h-10 w-40 rounded-full border border-white/10 bg-slate-950/70 px-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        {filteredPosts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.author} · {post.timePosted}</p>
              </div>
              <button
                type="button"
                onClick={() => onDeletePost(post.id)}
                className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                Delete
              </button>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{post.body.join(' ')}</p>
          </article>
        ))}
        {!filteredPosts.length ? <p className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">No posts match the current search.</p> : null}
      </div>
    </section>
  )
}