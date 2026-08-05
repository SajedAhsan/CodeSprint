import { useState } from 'react'

const TABS = ['Discussion', 'Solution']

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-5 py-2 text-sm font-semibold transition-all',
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      {children}
    </button>
  )
}

function Avatar({ username }) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
  ]
  const color = colors[username.charCodeAt(0) % colors.length]
  return (
    <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold', color)}>
      {username[0].toUpperCase()}
    </div>
  )
}

function DiscussionThread({ item, depth = 0, onLike, onReply, replyTargetId, setReplyTargetId, replyText, setReplyText }) {
  const isReplying = replyTargetId === item.id

  return (
    <div className={cn(
      'rounded-2xl border bg-white p-4 shadow-sm transition-all',
      depth > 0 ? 'ml-8 border-blue-100 border-l-2' : 'border-slate-100',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar username={item.username} />
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">{item.username}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isReplying) {
              setReplyTargetId(null)
            } else {
              setReplyTargetId(item.id)
              setReplyText('')
            }
          }}
          className="flex-shrink-0 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all"
        >
          {isReplying ? '✕ Cancel' : '↩ Reply'}
        </button>
      </div>

      {/* Comment body */}
      <p className="mt-3 ml-10 text-sm leading-relaxed text-slate-600">{item.comment}</p>

      {/* Like */}
      <div className="mt-3 ml-10">
        <button
          type="button"
          onClick={() => onLike(item.id)}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/60 hover:bg-blue-100 border border-blue-100 px-3 py-1 text-xs text-blue-700 font-semibold transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          {item.likes} {item.likes === 1 ? 'Like' : 'Likes'}
        </button>
      </div>

      {/* Inline reply box */}
      {isReplying && (
        <div className="mt-4 ml-10 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Reply to {item.username}
          </p>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-slate-800 resize-none"
            rows={2}
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
          />
          <div className="mt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setReplyTargetId(null)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onReply(item.id)}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {item.replies?.length > 0 && (
        <div className="mt-4 space-y-3">
          {item.replies.map((reply, idx) => (
            <DiscussionThread
              key={`${reply.id || reply.username}-${idx}`}
              item={reply}
              depth={depth + 1}
              onLike={onLike}
              onReply={onReply}
              replyTargetId={replyTargetId}
              setReplyTargetId={setReplyTargetId}
              replyText={replyText}
              setReplyText={setReplyText}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProblemPage({ onBack, initialTab = 'Discussion', problem, onUpdateProblem }) {
  // Normalise tab — old tabs that no longer exist fall back to Discussion
  const resolvedTab = TABS.includes(initialTab) ? initialTab : 'Discussion'
  const [activeTab, setActiveTab] = useState(resolvedTab)

  const [newCommentText, setNewCommentText] = useState('')
  const [replyTargetId, setReplyTargetId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [codeLang, setCodeLang] = useState('C++')

  /* ── handlers ── */
  const handlePostComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const comment = {
      id: Date.now(),
      username: 'You',
      time: 'Just now',
      comment: newCommentText.trim(),
      likes: 0,
      replies: [],
    }
    onUpdateProblem({ ...problem, discussion: [comment, ...(problem.discussion || [])] })
    setNewCommentText('')
  }

  const handleLike = (commentId) => {
    const walk = (list) =>
      list.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + 1 }
          : { ...c, replies: walk(c.replies || []) },
      )
    onUpdateProblem({ ...problem, discussion: walk(problem.discussion || []) })
  }

  const handleReply = (commentId) => {
    if (!replyText.trim()) return
    const reply = {
      id: Date.now(),
      username: 'You',
      time: 'Just now',
      comment: replyText.trim(),
      likes: 0,
      replies: [],
    }
    const walk = (list) =>
      list.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : { ...c, replies: walk(c.replies || []) },
      )
    onUpdateProblem({ ...problem, discussion: walk(problem.discussion || []) })
    setReplyText('')
    setReplyTargetId(null)
  }

  const discussion = problem.discussion || []
  const diffColor =
    problem.difficulty === 'Easy'
      ? 'bg-emerald-100 text-emerald-700'
      : problem.difficulty === 'Hard'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-amber-100 text-amber-700'

  return (
    <div className="space-y-5">
      {/* ── Header Card ── */}
      <div className="rounded-[24px] border border-white/70 bg-white/95 px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 focus:outline-none transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to problems
        </button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{problem.name}</h1>
              <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold', diffColor)}>
                {problem.difficulty}
              </span>
            </div>
            {/* Concept tags */}
            {problem.concept && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {problem.concept.split(', ').map((tag) => (
                  <span key={tag} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Solve on Judge CTA */}
          {problem.judgeUrl && (
            <a
              href={problem.judgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              Solve on External Judge
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* ── Tab Container ── */}
      <div className="rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
        {/* Tab bar */}
        <div className="border-b border-slate-200 px-5 py-3.5">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                {tab}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* ── Discussion Tab ── */}
          {activeTab === 'Discussion' && (
            <div className="space-y-6">
              {/* New comment form */}
              <form
                onSubmit={handlePostComment}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
                  Share your thoughts
                </p>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  placeholder="Ask a question, share a hint, or discuss approaches with the community..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 shadow-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Thread list */}
              <div className="space-y-4">
                {discussion.length > 0 ? (
                  discussion.map((item, idx) => (
                    <DiscussionThread
                      key={item.id ?? `${item.username}-${idx}`}
                      item={item}
                      onLike={handleLike}
                      onReply={handleReply}
                      replyTargetId={replyTargetId}
                      setReplyTargetId={setReplyTargetId}
                      replyText={replyText}
                      setReplyText={setReplyText}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No comments yet</p>
                    <p className="text-xs text-slate-400 mt-1">Be the first to start the discussion!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Solution Tab ── */}
          {activeTab === 'Solution' && (
            <div className="space-y-6">
              {problem.solution ? (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid lg:grid-cols-[1fr_1fr]">
                    {/* Editorial text + code */}
                    <div className="p-5 sm:p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                        Editorial Walkthrough
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {problem.solution.explanation}
                      </p>
                      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                          <span className="text-xs font-semibold text-slate-400">Solution</span>
                          <div className="flex gap-1">
                            {['C++', 'Java', 'Python'].map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => setCodeLang(lang)}
                                className={cn(
                                  'px-3 py-1 rounded-full text-[11px] font-bold transition-all',
                                  codeLang === lang
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10',
                                )}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-slate-100 font-mono">
                          <code>{problem.solution.codes?.[codeLang] || problem.solution.code || ''}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Video */}
                    <div className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 p-4 sm:p-6 flex items-center justify-center">
                      {problem.solution.video ? (
                        <iframe
                          title="Solution Video"
                          src={problem.solution.video}
                          className="aspect-video w-full rounded-2xl border border-slate-200 shadow-sm"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center py-10">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <p className="text-sm text-slate-400">No video available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ) : (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="text-sm font-semibold text-slate-500">No solution available yet</p>
                  <p className="text-xs text-slate-400 mt-1">Check back later or discuss approaches in the Discussion tab.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
