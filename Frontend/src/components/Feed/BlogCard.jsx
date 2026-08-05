import { useMemo, useState } from 'react'

function ActionButton({ label, active = false, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
        active
          ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
          : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      ].join(' ')}
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

function VoteIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      {direction === 'up' ? (
        <path d="M12 5l6 7h-4v7H10v-7H6l6-7z" fill="currentColor" />
      ) : (
        <path d="M12 19l-6-7h4V5h4v7h4l-6 7z" fill="currentColor" />
      )}
    </svg>
  )
}

export default function BlogCard({ post }) {
  const [voteCount, setVoteCount] = useState(post.votes)
  const [activeVote, setActiveVote] = useState(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(
    post.comments.map((comment) => ({
      ...comment,
      replies: comment.replies ?? [],
    })),
  )
  const [activeReplyPath, setActiveReplyPath] = useState(null)
  const [replyText, setReplyText] = useState('')

  const commentCount = comments.length

  const badgeLabel = useMemo(() => {
    if (commentCount === 0) return 'No comments yet'
    if (commentCount === 1) return '1 comment'
    return `${commentCount} comments`
  }, [commentCount])

  const handleVote = (direction) => {
    setActiveVote((current) => {
      const next = current === direction ? null : direction

      setVoteCount((currentVotes) => {
        if (current === direction) return currentVotes - 1
        if (current === null) return currentVotes + 1
        return direction === 'up' ? currentVotes + 2 : currentVotes - 2
      })

      return next
    })
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault()

    const trimmedComment = commentText.trim()
    if (!trimmedComment) return

    setComments((currentComments) => [
      ...currentComments,
      { author: 'You', text: trimmedComment },
    ])
    setCommentText('')
    setCommentsOpen(true)
  }

  const addReplyAtPath = (nodes, pathParts, reply) => {
    if (pathParts.length === 0) return nodes

    const [currentIndex, ...restPath] = pathParts

    return nodes.map((node, index) => {
      if (index !== currentIndex) return node

      if (restPath.length === 0) {
        return {
          ...node,
          replies: [...(node.replies ?? []), reply],
        }
      }

      return {
        ...node,
        replies: addReplyAtPath(node.replies ?? [], restPath, reply),
      }
    })
  }

  const handleReplySubmit = (event, replyPath) => {
    event.preventDefault()

    const trimmedReply = replyText.trim()
    if (!trimmedReply) return

    const pathParts = replyPath.split('-').map(Number)

    setComments((currentComments) =>
      addReplyAtPath(currentComments, pathParts, {
        author: 'You',
        text: trimmedReply,
        replies: [],
      }),
    )

    setReplyText('')
    setActiveReplyPath(null)
    setCommentsOpen(true)
  }

  const renderCommentThread = (comment, path, depth = 0) => {
    const pathKey = path.join('-')

    return (
      <div
        key={pathKey}
        className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
        style={{ marginLeft: depth > 0 ? `${Math.min(depth, 4) * 1.25}rem` : 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 font-semibold text-slate-900">{comment.author}</p>
            <p>{comment.text}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCommentsOpen(true)
              setActiveReplyPath((current) => (current === pathKey ? null : pathKey))
              setReplyText('')
            }}
            className="shrink-0 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Reply
          </button>
        </div>

        <div className="mt-3 space-y-2 border-l border-slate-200 pl-4">
          {(comment.replies ?? []).map((reply, replyIndex) =>
            renderCommentThread(reply, [...path, replyIndex], depth + 1),
          )}

          {activeReplyPath === pathKey && (
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => handleReplySubmit(event, pathKey)}>
              <input
                type="text"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder={`Reply to ${comment.author}`}
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(255,255,255,0))] px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Blog post
            </div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{post.title}</h2>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-right text-sm text-blue-700">
            <p className="font-semibold">{voteCount} votes</p>
            <p className="text-xs text-blue-600/80">{badgeLabel}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{post.timePosted}</span>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5 sm:px-7">
        <div className="space-y-4 text-[15px] leading-7 text-slate-700 sm:text-base">
          {post.body.map((paragraph, index) => (
            <p key={`${post.id}-body-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton label="Comment" active={commentsOpen} onClick={() => setCommentsOpen((current) => !current)}>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M4 5.5h16v10H8l-4 4v-4H4v-10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </ActionButton>

          <ActionButton label="Up vote" active={activeVote === 'up'} onClick={() => handleVote('up')}>
            <VoteIcon direction="up" />
          </ActionButton>

          <ActionButton label="Down vote" active={activeVote === 'down'} onClick={() => handleVote('down')}>
            <VoteIcon direction="down" />
          </ActionButton>
        </div>

        {commentsOpen && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment"
                className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Post comment
              </button>
            </form>

            <div className="mt-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet.</p>
              ) : (
                comments.map((comment, index) => renderCommentThread(comment, [index]))
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}