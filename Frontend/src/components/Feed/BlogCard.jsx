import { useMemo, useState, useEffect, useRef } from 'react'
import AttachmentUploader from '../Shared/AttachmentUploader'

function getAuthHeaders() {
  const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

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

export default function BlogCard({ post, onEditBlog, onDeleteBlog, onBlogUpdated }) {
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [isLiked, setIsLiked] = useState(Boolean(post.isLikedByCurrentUser))
  const [isLiking, setIsLiking] = useState(false)

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const [activeReplyId, setActiveReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  const [isDeletingBlog, setIsDeletingBlog] = useState(false)
  const [blogAttachments, setBlogAttachments] = useState(post.attachments ?? [])

  // Pending files for new comment
  const [pendingCommentFiles, setPendingCommentFiles] = useState([])
  const commentFileInputRef = useRef(null)

  // Pending files for reply
  const [pendingReplyFiles, setPendingReplyFiles] = useState([])
  const replyFileInputRef = useRef(null)

  // Pending files for edit
  const [pendingEditFiles, setPendingEditFiles] = useState([])
  const editFileInputRef = useRef(null)

  const currentUsername = localStorage.getItem('codesprintUsername')
  const currentUserId = localStorage.getItem('codesprintUserId')

  const isAuthor =
    (currentUsername && post.authorUsername && currentUsername.toLowerCase() === post.authorUsername.toLowerCase()) ||
    (currentUserId && post.authorId && String(currentUserId) === String(post.authorId))

  // Synchronize state when post prop updates
  useEffect(() => {
    setLikeCount(post.likeCount ?? 0)
    setIsLiked(Boolean(post.isLikedByCurrentUser))
    setBlogAttachments(post.attachments ?? [])
  }, [post.likeCount, post.isLikedByCurrentUser, post.attachments])

  const fetchComments = async () => {
    if (!post.blogId) return
    try {
      setIsLoadingComments(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs/${post.blogId}/comments` : `/api/blogs/${post.blogId}/comments`
      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch comments for blog', post.blogId, err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleToggleComments = () => {
    const nextState = !commentsOpen
    setCommentsOpen(nextState)
    if (nextState) {
      fetchComments()
    }
  }

  const handleLikeBlog = async () => {
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to like this blog.')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    // Optimistic update
    const previousLiked = isLiked
    const previousCount = likeCount
    const nextLiked = !isLiked
    const nextCount = nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1)

    setIsLiked(nextLiked)
    setLikeCount(nextCount)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs/${post.blogId}/react` : `/api/blogs/${post.blogId}/react`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        setIsLiked(Boolean(data.isLiked))
        setLikeCount(data.likeCount ?? nextCount)
        onBlogUpdated?.({ ...post, likeCount: data.likeCount, isLikedByCurrentUser: data.isLiked })
      } else {
        // Revert on failure
        setIsLiked(previousLiked)
        setLikeCount(previousCount)
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to update reaction.')
      }
    } catch (err) {
      console.error('Error toggling blog reaction:', err)
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
    } finally {
      setIsLiking(false)
    }
  }

  const uploadFilesToComment = async (commentId, files) => {
    if (!files || !files.length || !commentId) return
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) return
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
    try {
      const res = await fetch(`${API_BASE_URL}/api/attachments/comment/${commentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('Comment attachment upload error:', errData)
        alert(errData.message || 'Comment posted, but attachments failed to upload.')
      }
    } catch (err) {
      console.error('Error uploading comment attachments:', err)
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed) return

    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to comment.')
      return
    }

    try {
      setIsSubmittingComment(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs/${post.blogId}/comments` : `/api/blogs/${post.blogId}/comments`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: trimmed }),
      })

      if (res.ok) {
        const newComment = await res.json().catch(() => null)
        const newCommentId = newComment?.commentId
        if (pendingCommentFiles.length && newCommentId) {
          await uploadFilesToComment(newCommentId, pendingCommentFiles)
        }
        setCommentText('')
        setPendingCommentFiles([])
        await fetchComments()
        onBlogUpdated?.({ ...post, commentCount: (post.commentCount || 0) + 1 })
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to post comment.')
      }
    } catch (err) {
      console.error('Error posting comment:', err)
      alert('Network error while posting comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReplySubmit = async (event, parentCommentId) => {
    event.preventDefault()
    const trimmed = replyText.trim()
    if (!trimmed) return

    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to reply.')
      return
    }

    try {
      setIsSubmittingReply(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs/${post.blogId}/comments` : `/api/blogs/${post.blogId}/comments`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: trimmed, parentCommentId }),
      })

      if (res.ok) {
        const newReply = await res.json().catch(() => null)
        const newReplyId = newReply?.commentId
        if (pendingReplyFiles.length && newReplyId) {
          await uploadFilesToComment(newReplyId, pendingReplyFiles)
        }
        setReplyText('')
        setPendingReplyFiles([])
        setActiveReplyId(null)
        await fetchComments()
        onBlogUpdated?.({ ...post, commentCount: (post.commentCount || 0) + 1 })
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to post reply.')
      }
    } catch (err) {
      console.error('Error posting reply:', err)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleUpdateComment = async (event, commentId) => {
    event.preventDefault()
    const trimmed = editCommentText.trim()
    if (!trimmed) return

    try {
      setIsSubmittingEdit(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/comments/${commentId}` : `/api/comments/${commentId}`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: trimmed }),
      })

      if (res.ok) {
        if (pendingEditFiles.length) {
          await uploadFilesToComment(commentId, pendingEditFiles)
        }
        setEditingCommentId(null)
        setEditCommentText('')
        setPendingEditFiles([])
        await fetchComments()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to update comment.')
      }
    } catch (err) {
      console.error('Error updating comment:', err)
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/comments/${commentId}` : `/api/comments/${commentId}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        await fetchComments()
        onBlogUpdated?.({ ...post, commentCount: Math.max(0, (post.commentCount || 1) - 1) })
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to delete comment.')
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      alert('Please log in to like this comment.')
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/comments/${commentId}/react` : `/api/comments/${commentId}/react`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        const updateTree = (list) =>
          list.map((c) => {
            if (c.commentId === commentId) {
              return { ...c, likeCount: data.likeCount, isLikedByCurrentUser: data.isLiked }
            }
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: updateTree(c.replies) }
            }
            return c
          })
        setComments((prev) => updateTree(prev))
      }
    } catch (err) {
      console.error('Error liking comment:', err)
    }
  }

  const handleDeleteBlog = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeletingBlog(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs/${post.blogId}` : `/api/blogs/${post.blogId}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        onDeleteBlog?.(post.blogId)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to delete blog post.')
      }
    } catch (err) {
      console.error('Error deleting blog:', err)
      alert('Network error while deleting blog.')
    } finally {
      setIsDeletingBlog(false)
    }
  }

  const badgeLabel = useMemo(() => {
    const count = post.commentCount ?? comments.length
    if (count === 0) return 'No comments yet'
    if (count === 1) return '1 comment'
    return `${count} comments`
  }, [post.commentCount, comments.length])

  // Split content by newlines into paragraphs
  const paragraphs = useMemo(() => {
    if (Array.isArray(post.body)) return post.body
    if (typeof post.content === 'string') {
      return post.content.split('\n').filter((p) => p.trim().length > 0)
    }
    return []
  }, [post.content, post.body])

  const renderCommentNode = (comment, depth = 0) => {
    const isCommentAuthor =
      (currentUsername && comment.authorUsername && currentUsername.toLowerCase() === comment.authorUsername.toLowerCase()) ||
      (currentUserId && comment.authorId && String(currentUserId) === String(comment.authorId))

    const isEditing = editingCommentId === comment.commentId
    const isReplying = activeReplyId === comment.commentId

    return (
      <div
        key={comment.commentId}
        className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
        style={{ marginLeft: depth > 0 ? `${Math.min(depth, 4) * 1.25}rem` : 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{comment.authorUsername || comment.author || 'Anonymous'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400">{formatBlogDate(comment.createdAt || comment.timePosted)}</span>
            </div>

            {isEditing ? (
              <form onSubmit={(e) => handleUpdateComment(e, comment.commentId)} className="mt-2 space-y-2">
                <input
                  type="text"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
                {/* File picker for edit */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || [])
                      setPendingEditFiles((prev) => {
                        const names = new Set(prev.map((f) => f.name))
                        return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
                      })
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Attach
                  </button>
                  {pendingEditFiles.map((f) => (
                    <span key={f.name} className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                      <span className="max-w-[120px] truncate">{f.name}</span>
                      <button type="button" onClick={() => setPendingEditFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(null)
                      setEditCommentText('')
                      setPendingEditFiles([])
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="mt-1 text-slate-800 leading-relaxed">{comment.content || comment.text}</p>
                {/* Render comment attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2">
                    <AttachmentUploader
                      entityType="comment"
                      entityId={comment.commentId}
                      attachments={comment.attachments}
                      currentUsername={currentUsername}
                      showUploadButton={false}
                      onDeleted={() => fetchComments()}
                      compact
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Comment Like Button */}
            <button
              type="button"
              onClick={() => handleLikeComment(comment.commentId)}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                comment.isLikedByCurrentUser
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Like comment"
            >
              <svg viewBox="0 0 24 24" fill={comment.isLikedByCurrentUser ? 'currentColor' : 'none'} className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>{comment.likeCount ?? 0}</span>
            </button>

            {/* Reply Button */}
            <button
              type="button"
              onClick={() => {
                setActiveReplyId((curr) => (curr === comment.commentId ? null : comment.commentId))
                setReplyText('')
                setPendingReplyFiles([])
              }}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded-lg"
            >
              Reply
            </button>

            {/* Comment Author Edit/Delete */}
            {isCommentAuthor && !isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(comment.commentId)
                    setEditCommentText(comment.content || comment.text || '')
                  }}
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 px-1.5 py-1 hover:bg-slate-100 rounded-lg"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.commentId)}
                  className="text-xs font-semibold text-rose-500 transition hover:text-rose-700 px-1.5 py-1 hover:bg-rose-50 rounded-lg"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reply form and sub-replies */}
        <div className="mt-3 space-y-2 border-l-2 border-blue-100 pl-3">
          {isReplying && (
            <form className="flex flex-col gap-2 py-1" onSubmit={(e) => handleReplySubmit(e, comment.commentId)}>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.authorUsername || 'author'}...`}
                  className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveReplyId(null); setPendingReplyFiles([]) }}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
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
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setPendingReplyFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            </form>
          )}

          {(comment.replies ?? []).map((reply) => renderCommentNode(reply, depth + 1))}
        </div>
      </div>
    )
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
      {/* Header */}
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0))] px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Blog post
            </div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl leading-tight">{post.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-2 text-right text-sm text-blue-700">
              <p className="font-semibold">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>
              <p className="text-xs text-blue-600/80">{badgeLabel}</p>
            </div>

            {/* Author actions: Edit & Delete */}
            {isAuthor && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => onEditBlog?.(post)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  title="Edit your blog post"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isDeletingBlog}
                  onClick={handleDeleteBlog}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-50"
                  title="Delete your blog post"
                >
                  {isDeletingBlog ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {(post.authorUsername || post.author || 'U').charAt(0).toUpperCase()}
            </span>
            {post.authorUsername || post.author}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{formatBlogDate(post.createdAt || post.timePosted)}</span>
        </div>
      </div>

      {/* Body & Actions */}
      <div className="space-y-5 px-6 py-5 sm:px-7">
        <div className="space-y-4 text-[15px] leading-7 text-slate-700 sm:text-base">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={`${post.blogId || post.id}-body-${index}`}>{paragraph}</p>)
          ) : (
            <p className="text-slate-400 italic">No content provided.</p>
          )}
        </div>

        {/* Blog-level attachments rendering */}
        {blogAttachments && blogAttachments.length > 0 && (
          <div className="pt-1">
            <AttachmentUploader
              entityType="blog"
              entityId={post.blogId}
              attachments={blogAttachments}
              currentUsername={currentUsername}
              showUploadButton={false}
              onDeleted={(id) => setBlogAttachments((prev) => prev.filter((a) => a.attachmentId !== id))}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLikeBlog}
            disabled={isLiking}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              isLiked
                ? 'border-rose-500 bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                : 'border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} className="h-4 w-4" aria-hidden="true">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <span>{isLiked ? 'Liked' : 'Like'} ({likeCount})</span>
          </button>

          {/* Comment Toggle Button */}
          <button
            type="button"
            onClick={handleToggleComments}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              commentsOpen
                ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M4 5.5h16v10H8l-4 4v-4H4v-10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span>Comments ({post.commentCount ?? comments.length})</span>
          </button>
        </div>

        {/* Comment Section */}
        {commentsOpen && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 mt-4 transition">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Discussion ({comments.length})</h3>

            <form className="flex flex-col gap-2" onSubmit={handleCommentSubmit}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this post..."
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
              {/* Attach button row */}
              <div className="flex flex-wrap items-center gap-2 pl-1">
                <input
                  ref={commentFileInputRef}
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
                  onClick={() => commentFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  Attach
                </button>
                {pendingCommentFiles.map((f) => (
                  <span key={f.name} className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setPendingCommentFiles((p) => p.filter((x) => x !== f))} className="text-violet-400 hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                  <svg className="h-5 w-5 animate-spin text-blue-600 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500 bg-white/50">
                  No comments yet. Start the conversation!
                </div>
              ) : (
                comments.map((comment) => renderCommentNode(comment, 0))
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}