import { useState, useEffect, useRef } from 'react'
import AttachmentUploader from '../Shared/AttachmentUploader'

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

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    if (diffInSeconds < 60) return 'Just now'
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  } catch (e) {
    return 'Just now'
  }
}

function CommentItem({
  comment,
  discussionId,
  currentUsername,
  replyTargetId,
  setReplyTargetId,
  replyText,
  setReplyText,
  onReply,
  onDeleteComment,
  depth = 0,
}) {
  const isReplying = replyTargetId === comment.commentId
  const isOwner = currentUsername && currentUsername.toLowerCase() === (comment.authorUsername || '').toLowerCase()
  const [commentAttachments, setCommentAttachments] = useState(comment.attachments ?? [])

  // State for reply attachments
  const [pendingReplyFiles, setPendingReplyFiles] = useState([])
  const replyFileInputRef = useRef(null)

  useEffect(() => {
    setCommentAttachments(comment.attachments ?? [])
  }, [comment.attachments])

  const handlePostReply = async () => {
    await onReply(discussionId, comment.commentId, pendingReplyFiles)
    setPendingReplyFiles([])
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-3.5 shadow-sm transition-all',
        depth > 0 ? 'ml-6 sm:ml-8 border-blue-100 border-l-2 bg-blue-50/20' : 'border-slate-100',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar username={comment.authorUsername || 'User'} />
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">{comment.authorUsername || 'Anonymous'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatTimeAgo(comment.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (isReplying) {
                setReplyTargetId(null)
                setPendingReplyFiles([])
              } else {
                setReplyTargetId(comment.commentId)
                setReplyText('')
                setPendingReplyFiles([])
              }
            }}
            className="rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all"
          >
            {isReplying ? '✕ Cancel' : '↩ Reply'}
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => onDeleteComment(comment.commentId)}
              className="rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-all"
              title="Delete comment"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <p className="mt-2.5 ml-10 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{comment.content}</p>

      {/* Comment attachments */}
      {commentAttachments && commentAttachments.length > 0 && (
        <div className="ml-10 mt-2">
          <AttachmentUploader
            entityType="comment"
            entityId={comment.commentId}
            attachments={commentAttachments}
            currentUsername={currentUsername}
            showUploadButton={false}
            onDeleted={() => fetchDiscussions()}
            compact
          />
        </div>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-3 ml-10 p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Reply to {comment.authorUsername}
          </p>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-slate-800 resize-none"
            rows={2}
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
          />
          {/* File picker for reply */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={replyFileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || [])
                setPendingReplyFiles((prev) => {
                  const names = new Set(prev.map((f) => f.name))
                  return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
                })
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => replyFileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              Attach
            </button>
            {pendingReplyFiles.map((f) => (
              <span key={f.name} className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button type="button" onClick={() => setPendingReplyFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setReplyTargetId(null); setPendingReplyFiles([]) }}
              className="px-3 py-1 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePostReply}
              className="px-4 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              discussionId={discussionId}
              currentUsername={currentUsername}
              replyTargetId={replyTargetId}
              setReplyTargetId={setReplyTargetId}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={onReply}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DiscussionCard({
  item,
  currentUsername,
  onLike,
  onDeleteDiscussion,
  onAddComment,
  onReply,
  onDeleteComment,
  replyTargetId,
  setReplyTargetId,
  replyText,
  setReplyText,
}) {
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingCommentFiles, setPendingCommentFiles] = useState([])
  const discCommentFileRef = useRef(null)

  const disc = item.discussion || item
  const comments = item.comments || []
  const discAttachments = disc.attachments || item.attachments || []
  const isOwner = currentUsername && currentUsername.toLowerCase() === (disc.authorUsername || '').toLowerCase()

  const handlePostDirectComment = async () => {
    if (!commentInput.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const newCommentId = await onAddComment(disc.discussionId, commentInput.trim())
      if (pendingCommentFiles.length && newCommentId) {
        const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
        if (token) {
          const formData = new FormData()
          pendingCommentFiles.forEach((f) => formData.append('files', f))
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
          await fetch(`${API_BASE_URL}/api/attachments/comment/${newCommentId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }).catch(() => {})
        }
      }
      setCommentInput('')
      setPendingCommentFiles([])
      setShowCommentBox(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar username={disc.authorUsername || 'User'} />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">{disc.authorUsername || 'Anonymous'}</p>
            <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(disc.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => onDeleteDiscussion(disc.discussionId)}
            className="rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-all"
            title="Delete discussion"
          >
            Delete
          </button>
        )}
      </div>

      {/* Discussion Content */}
      <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{disc.content}</p>

      {/* Discussion Attachments */}
      {discAttachments && discAttachments.length > 0 && (
        <div className="pt-1">
          <AttachmentUploader
            entityType="discussion"
            entityId={disc.discussionId}
            attachments={discAttachments}
            currentUsername={currentUsername}
            showUploadButton={false}
            onDeleted={() => fetchDiscussions()}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onLike(disc.discussionId)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all border',
            disc.isLikedByCurrentUser
              ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={disc.isLikedByCurrentUser ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {disc.likeCount || 0} {disc.likeCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button
          type="button"
          onClick={() => setShowCommentBox(!showCommentBox)}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length || disc.commentCount || 0} Comments
        </button>
      </div>

      {/* Inline Comment Box */}
      {showCommentBox && (
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
          <textarea
            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-slate-800 resize-none"
            rows={2}
            placeholder="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            autoFocus
          />
          {/* File picker for comment */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={discCommentFileRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || [])
                setPendingCommentFiles((prev) => {
                  const names = new Set(prev.map((f) => f.name))
                  return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
                })
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => discCommentFileRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              Attach
            </button>
            {pendingCommentFiles.map((f) => (
              <span key={f.name} className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button type="button" onClick={() => setPendingCommentFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowCommentBox(false); setPendingCommentFiles([]) }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePostDirectComment}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-sm"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      )}

      {/* Nested Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 pt-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              discussionId={disc.discussionId}
              currentUsername={currentUsername}
              replyTargetId={replyTargetId}
              setReplyTargetId={setReplyTargetId}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={onReply}
              onDeleteComment={onDeleteComment}
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
  const resolvedTab = TABS.includes(initialTab) ? initialTab : 'Discussion'
  const [activeTab, setActiveTab] = useState(resolvedTab)

  useEffect(() => {
    if (initialTab && TABS.includes(initialTab)) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const pId = problem?.id ?? problem?.problemId
      const url = `/problems?id=${pId}&tab=${tab}`
      window.history.replaceState({ view: 'problems', problemId: pId, tab }, '', url)
    }
  }

  const [newDiscussionText, setNewDiscussionText] = useState('')
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false)
  const [pendingDiscussionFiles, setPendingDiscussionFiles] = useState([])
  const discussionFileInputRef = useRef(null)

  const [replyTargetId, setReplyTargetId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [codeLang, setCodeLang] = useState('C++')
  const [solutionTab, setSolutionTab] = useState('Code')

  const [editorialData, setEditorialData] = useState(problem.solution || null)
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false)

  const [discussionsList, setDiscussionsList] = useState([])
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false)

  const problemId = problem?.id ?? problem?.problemId
  const currentUsername = localStorage.getItem('codesprintUsername') || ''

  const getAuthHeaders = () => {
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchDiscussions = async () => {
    if (!problemId) return
    try {
      setIsLoadingDiscussions(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/problem/${problemId}?details=true`
        : `/api/discussions/problem/${problemId}?details=true`

      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        setDiscussionsList(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching discussions:', err)
    } finally {
      setIsLoadingDiscussions(false)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [problemId])

  useEffect(() => {
    if (!problemId) return
    let isMounted = true
    const fetchEditorial = async () => {
      try {
        setIsLoadingEditorial(true)
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
        const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/editorials/problem/${problemId}` : `/api/editorials/problem/${problemId}`
        const res = await fetch(endpoint, { headers: getAuthHeaders() })
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
            attachments: data.attachments || [],
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

  /* ── discussion handlers ── */
  const handlePostDiscussion = async (e) => {
    e.preventDefault()
    if (!newDiscussionText.trim() || isPostingDiscussion) return

    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to participate in the discussion.')
      return
    }

    try {
      setIsPostingDiscussion(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/problem/${problemId}`
        : `/api/discussions/problem/${problemId}`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newDiscussionText.trim() }),
      })

      if (res.ok) {
        const data = await res.json().catch(() => null)
        const discId = data?.discussionId
        if (pendingDiscussionFiles.length && discId) {
          const formData = new FormData()
          pendingDiscussionFiles.forEach((f) => formData.append('files', f))
          const uploadRes = await fetch(`${API_BASE_URL}/api/attachments/discussion/${discId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}))
            console.error('Discussion attachment upload error:', errData)
            alert(errData.message || 'Discussion was created, but attachments failed to upload.')
          }
        }
        setNewDiscussionText('')
        setPendingDiscussionFiles([])
        await fetchDiscussions()
      } else {
        const errorData = await res.json().catch(() => ({}))
        alert(errorData.message || 'Failed to post discussion.')
      }
    } catch (err) {
      console.error('Error posting discussion:', err)
      alert('Error connecting to server.')
    } finally {
      setIsPostingDiscussion(false)
    }
  }

  const handleLikeDiscussion = async (discussionId) => {
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to like a discussion.')
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/${discussionId}/react`
        : `/api/discussions/${discussionId}/react`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        setDiscussionsList((prev) =>
          prev.map((item) => {
            const disc = item.discussion || item
            if (disc.discussionId === discussionId) {
              return {
                ...item,
                discussion: {
                  ...disc,
                  likeCount: data.likeCount,
                  isLikedByCurrentUser: data.isLiked,
                },
              }
            }
            return item
          }),
        )
      }
    } catch (err) {
      console.error('Error reacting to discussion:', err)
    }
  }

  const handleAddCommentToDiscussion = async (discussionId, content) => {
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to comment.')
      return null
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/${discussionId}/comments`
        : `/api/discussions/${discussionId}/comments`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const data = await res.json().catch(() => null)
        await fetchDiscussions()
        return data?.commentId ?? null
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to add comment.')
        return null
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      return null
    }
  }

  const handleReplyToComment = async (discussionId, parentCommentId, files = []) => {
    if (!replyText.trim()) return

    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to reply.')
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/${discussionId}/comments`
        : `/api/discussions/${discussionId}/comments`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content: replyText.trim(),
          parentCommentId,
        }),
      })

      if (res.ok) {
        const data = await res.json().catch(() => null)
        const replyId = data?.commentId
        if (files && files.length && replyId) {
          const formData = new FormData()
          files.forEach((f) => formData.append('files', f))
          await fetch(`${API_BASE_URL}/api/attachments/comment/${replyId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }).catch(() => {})
        }
        setReplyText('')
        setReplyTargetId(null)
        await fetchDiscussions()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to post reply.')
      }
    } catch (err) {
      console.error('Error replying to comment:', err)
    }
  }

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/discussions/${discussionId}`
        : `/api/discussions/${discussionId}`

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        setDiscussionsList((prev) =>
          prev.filter((item) => (item.discussion?.discussionId || item.discussionId) !== discussionId),
        )
      } else {
        alert('Failed to delete discussion.')
      }
    } catch (err) {
      console.error('Error deleting discussion:', err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL}/api/comments/${commentId}`
        : `/api/comments/${commentId}`

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        await fetchDiscussions()
      } else {
        alert('Failed to delete comment.')
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

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
              <TabButton key={tab} active={activeTab === tab} onClick={() => handleTabChange(tab)}>
                {tab}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* ── Discussion Tab ── */}
          {activeTab === 'Discussion' && (
            <div className="space-y-6">
              {/* New discussion form */}
              <form
                onSubmit={handlePostDiscussion}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
                  Start a discussion
                </p>
                <textarea
                  value={newDiscussionText}
                  onChange={(e) => setNewDiscussionText(e.target.value)}
                  rows={3}
                  placeholder="Ask a question, share a hint, or discuss approaches with the community..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 shadow-sm"
                />

                {/* Attachments row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={discussionFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || [])
                        setPendingDiscussionFiles((prev) => {
                          const names = new Set(prev.map((f) => f.name))
                          return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
                        })
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => discussionFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-all active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      Attach
                    </button>
                    {pendingDiscussionFiles.map((f) => (
                      <span key={f.name} className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
                        <span className="max-w-[120px] truncate">{f.name}</span>
                        <button type="button" onClick={() => setPendingDiscussionFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
                      </span>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isPostingDiscussion || !newDiscussionText.trim()}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
                  >
                    {isPostingDiscussion ? 'Posting...' : 'Post Discussion'}
                  </button>
                </div>
              </form>

              {/* Thread list */}
              <div className="space-y-4">
                {isLoadingDiscussions ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
                    <p className="text-sm font-medium text-slate-500">Loading discussions...</p>
                  </div>
                ) : discussionsList.length > 0 ? (
                  discussionsList.map((item) => {
                    const discId = item.discussion?.discussionId || item.discussionId
                    return (
                      <DiscussionCard
                        key={discId}
                        item={item}
                        currentUsername={currentUsername}
                        onLike={handleLikeDiscussion}
                        onDeleteDiscussion={handleDeleteDiscussion}
                        onAddComment={handleAddCommentToDiscussion}
                        onReply={handleReplyToComment}
                        onDeleteComment={handleDeleteComment}
                        replyTargetId={replyTargetId}
                        setReplyTargetId={setReplyTargetId}
                        replyText={replyText}
                        setReplyText={setReplyText}
                      />
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No discussions yet</p>
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
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                          Editorial Walkthrough
                        </p>
                        {solution.explanation ? (
                          <div className="prose prose-slate max-w-none text-sm leading-loose text-slate-700 whitespace-pre-wrap">
                            {solution.explanation}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No explanation provided yet.</p>
                        )}

                        {/* Editorial Attachments */}
                        {solution.attachments && solution.attachments.length > 0 && (
                          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 mt-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">
                              Editorial Resources & Diagrams ({solution.attachments.length})
                            </p>
                            <AttachmentUploader
                              entityType="editorial"
                              entityId={problemId}
                              attachments={solution.attachments}
                              currentUsername={currentUsername}
                              disabled
                              compact
                            />
                          </div>
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
