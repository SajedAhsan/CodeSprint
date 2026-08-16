import { useState, useEffect } from 'react'

const TABS = ['Discussion', 'Solution']

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getEmbedUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.includes('youtube.com/embed/')) return trimmed

  // youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`

  // youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`

  // youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`

  // youtube.com/live/<id>
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/)
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`

  // standard fallback regex
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = trimmed.match(regExp)
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`
  }
  return trimmed
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

function getCodeForLanguage(codes, lang) {
  if (!codes || typeof codes !== 'object') return ''
  if (codes[lang]) return codes[lang]
  const target = (lang || '').toLowerCase()
  for (const [key, value] of Object.entries(codes)) {
    const k = (key || '').toLowerCase()
    if (k === target) return value
    if ((target.includes('c++') || target.includes('cpp')) && (k.includes('c++') || k.includes('cpp'))) return value
    if (target.includes('java') && k.includes('java') && !k.includes('script')) return value
    if (target.includes('python') && (k.includes('python') || k.includes('py'))) return value
  }
  return ''
}

export default function ProblemPage({ onBack, initialTab = 'Discussion', problem, onUpdateProblem }) {
  // Normalise tab — old tabs that no longer exist fall back to Discussion
  const resolvedTab = TABS.includes(initialTab) ? initialTab : 'Discussion'
  const [activeTab, setActiveTab] = useState(resolvedTab)

  const [newCommentText, setNewCommentText] = useState('')
  const [replyTargetId, setReplyTargetId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [codeLang, setCodeLang] = useState('C++')
  const [solutionTab, setSolutionTab] = useState('Code')

  const [editorialData, setEditorialData] = useState(problem.solution || null)
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false)

  const problemId = problem?.id ?? problem?.problemId

  useEffect(() => {
    if (!problemId) return
    let isMounted = true
    const fetchEditorial = async () => {
      try {
        setIsLoadingEditorial(true)
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
        const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/editorials/problem/${problemId}` : `/api/editorials/problem/${problemId}`
        const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
        const headers = {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
        const res = await fetch(endpoint, { headers })
        if (!res.ok) {
          setIsLoadingEditorial(false)
          return
        }
        const data = await res.json()
        if (data && isMounted) {
          const codes = {}
          if (Array.isArray(data.solutions)) {
            data.solutions.forEach((s) => {
              if (s.language) {
                codes[s.language] = s.code || ''
              }
            })
          }
          const updated = {
            explanation: data.explanation || problem.solution?.explanation || '',
            codes: Object.keys(codes).length
              ? codes
              : (problem.solution?.codes || (problem.solution?.code ? { [problem.solution.language || 'Code']: problem.solution.code } : {})),
            video: data.videoLink || data.video || problem.solution?.video || problem.solution?.videoLink || null,
          }
          setEditorialData(updated)
          if (onUpdateProblem) {
            onUpdateProblem({ ...problem, solution: updated })
          }
        }
      } catch (err) {
        console.error('Error fetching editorial for problem:', err)
      } finally {
        if (isMounted) setIsLoadingEditorial(false)
      }
    }
    fetchEditorial()
    return () => {
      isMounted = false
    }
  }, [problemId])

  const solution = editorialData || problem.solution

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
              {isLoadingEditorial ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
                  <p className="text-sm font-medium text-slate-500">Loading solution & video tutorial...</p>
                </div>
              ) : solution ? (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Solution Sub-tabs */}
                  <div className="border-b border-slate-200 px-5 py-3.5 bg-slate-50/50">
                    <div className="flex flex-wrap gap-2">
                      <TabButton active={solutionTab === 'Code'} onClick={() => setSolutionTab('Code')}>
                        Code Solution
                      </TabButton>
                      <TabButton active={solutionTab === 'Explanation'} onClick={() => setSolutionTab('Explanation')}>
                        Explanation
                      </TabButton>
                      <TabButton active={solutionTab === 'Video'} onClick={() => setSolutionTab('Video')}>
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                          Video Tutorial
                        </span>
                      </TabButton>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 min-h-[400px]">
                    {solutionTab === 'Code' && (
                      <div className="h-full flex flex-col">
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg flex-1">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/50">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Implementation</span>
                            <div className="flex gap-1.5">
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
                          <pre className="overflow-x-auto px-5 py-5 text-sm leading-relaxed text-slate-100 font-mono">
                            <code>{getCodeForLanguage(solution.codes, codeLang) || solution.code || 'No code provided for this language.'}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {solutionTab === 'Explanation' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 mb-4">
                          Editorial Walkthrough
                        </p>
                        {solution.explanation ? (
                          <div className="prose prose-slate max-w-none text-sm leading-loose text-slate-700 whitespace-pre-wrap">
                            {solution.explanation}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No explanation provided yet.</p>
                        )}
                      </div>
                    )}

                    {solutionTab === 'Video' && (
                      <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto flex flex-col">
                        {solution.video ? (
                          <div className="w-full space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                  </svg>
                                </span>
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900 leading-none">YouTube Video Tutorial</h3>
                                  <p className="text-[11px] text-slate-400 mt-1">Watch step-by-step problem walkthrough & explanation</p>
                                </div>
                              </div>
                              <a
                                href={solution.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
                              >
                                Watch on YouTube
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl">
                              <iframe
                                title="Solution Video Tutorial"
                                src={getEmbedUrl(solution.video)}
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3 shadow-sm border border-red-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                              </svg>
                            </div>
                            <p className="text-base font-semibold text-slate-800">No video tutorial available yet</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              A video walkthrough for this problem has not been added to the database yet. Check out the Code Solution or Explanation tab!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ) : (
                <div className="flex flex-col items-center py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Coming soon</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">Check back later or discuss approaches with the community in the Discussion tab.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
