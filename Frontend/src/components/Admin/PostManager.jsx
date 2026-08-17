import { useState } from 'react'

function formatBlogDate(dateStr) {
  if (!dateStr) return 'Just now'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function PostManager({
  postForm,
  onChange,
  onSubmit,
  isPublishing,
  postQuery,
  onChangeQuery,
  filteredPosts,
  allPostsCount = 0,
  onDeletePost,
  onRefresh,
  isLoading,
  actionStatus,
}) {
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleConfirmDelete = async (id) => {
    setIsDeleting(true)
    try {
      await onDeletePost(id)
      setDeleteTargetId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.18)] backdrop-blur sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Blog Manager</p>
            <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
              {allPostsCount} {allPostsCount === 1 ? 'blog' : 'blogs'}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Moderate & Manage Platform Blogs</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            View all community and admin blogs, search across titles and authors, and moderate content with instant delete permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
              title="Refresh blogs from server"
            >
              <svg viewBox="0 0 24 24" fill="none" className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {showCreateForm ? 'Hide Composer' : 'Create Blog'}
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionStatus?.message && (
        <div
          className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-sm ${
            actionStatus.type === 'error'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          <span>{actionStatus.message}</span>
        </div>
      )}

      {/* Collapsible Create/Publish Form */}
      {showCreateForm && (
        <form className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-950/20 p-6 space-y-4" onSubmit={onSubmit}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-cyan-200">Publish New Blog</h3>
            <span className="text-xs text-slate-400">Published directly to community feed</span>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-300">Blog Title</span>
            <input
              type="text"
              required
              value={postForm.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="e.g. Mastering Dynamic Programming on CodeSprint"
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-300">Content</span>
            <textarea
              rows="6"
              required
              value={postForm.content || postForm.body || ''}
              onChange={(event) => {
                onChange('content', event.target.value)
                onChange('body', event.target.value)
              }}
              placeholder="Write the blog post content here... Supports multiple paragraphs."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {isPublishing ? 'Publishing...' : 'Publish Blog'}
            </button>
          </div>
        </form>
      )}

      {/* Search and Filter Section */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">All Platform Blogs</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredPosts.length} of {allPostsCount} blogs
            </p>
          </div>

          <div className="relative min-w-[260px] flex-1 max-w-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={postQuery}
              onChange={(event) => onChangeQuery(event.target.value)}
              placeholder="Search blogs by title, author, content, or ID..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-10 pr-10 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 focus:bg-slate-950"
            />
            {postQuery && (
              <button
                type="button"
                onClick={() => onChangeQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                <div className="h-5 w-1/3 rounded-lg bg-white/10 mb-3" />
                <div className="h-4 w-1/4 rounded-lg bg-white/5 mb-4" />
                <div className="h-16 w-full rounded-xl bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {/* Blog Post Cards List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const blogId = post.blogId ?? post.id
              const isExpanded = expandedIds.has(blogId)
              const contentText =
                typeof post.content === 'string'
                  ? post.content
                  : Array.isArray(post.body)
                  ? post.body.join('\n\n')
                  : ''
              const authorName = post.authorUsername || post.author || 'User'
              const formattedDate = formatBlogDate(post.createdAt || post.timePosted)
              const isConfirmingThis = deleteTargetId === blogId

              return (
                <article
                  key={blogId}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-mono font-medium text-cyan-300">
                          #{blogId}
                        </span>
                        <h4 className="text-base font-semibold text-white sm:text-lg">{post.title}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-[10px] font-bold text-cyan-300">
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                          {authorName}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span>{formattedDate}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-rose-400" aria-hidden="true">
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          {post.likeCount ?? post.votes ?? 0} likes
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-blue-400" aria-hidden="true">
                            <path d="M4 5.5h16v10H8l-4 4v-4H4v-10z" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          {post.commentCount ?? (post.comments?.length || 0)} comments
                        </span>
                      </div>
                    </div>

                    {/* Delete Controls */}
                    <div className="shrink-0">
                      {isConfirmingThis ? (
                        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-1.5">
                          <span className="px-2 text-xs font-medium text-rose-300">Are you sure?</span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleConfirmDelete(blogId)}
                            className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                          >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setDeleteTargetId(null)}
                            className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(blogId)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Delete Blog
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mt-4">
                    <p
                      className={`text-sm leading-relaxed text-slate-300 whitespace-pre-line ${
                        !isExpanded ? 'line-clamp-3' : ''
                      }`}
                    >
                      {contentText || 'No content.'}
                    </p>
                    {contentText.length > 200 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(blogId)}
                        className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        {isExpanded ? 'Show less' : 'Read full content'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}

            {!filteredPosts.length && (
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">
                  {postQuery ? `No blogs matched "${postQuery}"` : 'No blogs found'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {postQuery ? 'Try searching by different keywords or clear the filter.' : 'Create a blog to get started.'}
                </p>
                {postQuery && (
                  <button
                    type="button"
                    onClick={() => onChangeQuery('')}
                    className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}