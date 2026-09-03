import { useState, useEffect, useRef } from 'react'
import BlogNavbar from './BlogNavbar'
import AttachmentUploader from '../Shared/AttachmentUploader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function getToken() {
  return localStorage.getItem('codesprintToken') || localStorage.getItem('token') || ''
}

function getAuthHeaders() {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/** Small pill showing a queued (not-yet-uploaded) file */
function FilePill({ file, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
      <span className="max-w-[140px] truncate">{file.name}</span>
      <button
        type="button"
        onClick={() => onRemove(file)}
        className="ml-0.5 text-violet-400 hover:text-rose-500 transition-colors font-bold"
        title="Remove"
      >
        ×
      </button>
    </span>
  )
}

export default function BlogPostPage({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onLogout,
  editingBlog = null,
  onBlogSaved,
}) {
  const [title, setTitle] = useState(editingBlog ? editingBlog.title : '')
  const [content, setContent] = useState(
    editingBlog
      ? editingBlog.content || (Array.isArray(editingBlog.body) ? editingBlog.body.join('\n\n') : '')
      : ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Saved blog state (known once blog exists)
  const [savedBlogId, setSavedBlogId] = useState(editingBlog?.blogId ?? null)
  const [savedAttachments, setSavedAttachments] = useState(editingBlog?.attachments ?? [])

  // Pending files selected BEFORE the blog is saved
  const [pendingFiles, setPendingFiles] = useState([])
  const fileInputRef = useRef(null)

  const currentUsername = localStorage.getItem('codesprintUsername') || ''
  const isEditing = Boolean(editingBlog && editingBlog.blogId)

  useEffect(() => {
    if (editingBlog) {
      setTitle(editingBlog.title || '')
      setContent(
        editingBlog.content || (Array.isArray(editingBlog.body) ? editingBlog.body.join('\n\n') : '')
      )
      setSavedBlogId(editingBlog.blogId ?? null)
      setSavedAttachments(editingBlog.attachments ?? [])
    } else {
      setTitle('')
      setContent('')
      setSavedBlogId(null)
      setSavedAttachments([])
    }
    setPendingFiles([])
    setErrorMessage('')
  }, [editingBlog])

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || [])
    if (!newFiles.length) return
    setPendingFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
    })
    e.target.value = ''
  }

  const removePendingFile = (file) => {
    setPendingFiles((prev) => prev.filter((f) => f !== file))
  }

  /** Upload pending files to the saved blog */
  const uploadPendingFiles = async (blogId) => {
    if (!pendingFiles.length || !blogId) return
    const token = getToken()
    if (!token) return

    const formData = new FormData()
    pendingFiles.forEach((f) => formData.append('files', f))

    try {
      const res = await fetch(`${API_BASE_URL}/api/attachments/blog/${blogId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        const uploaded = await res.json()
        setSavedAttachments((prev) => [...prev, ...uploaded])
        setPendingFiles([])
      } else {
        const err = await res.json().catch(() => ({}))
        setErrorMessage(err.message || 'Blog saved but attachments failed to upload.')
      }
    } catch {
      setErrorMessage('Blog saved but could not upload attachments due to a network error.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setErrorMessage('Please provide a title for your blog post.')
      return
    }
    if (!trimmedContent) {
      setErrorMessage('Please write some content for your blog post.')
      return
    }

    const token = getToken()
    if (!token) {
      setErrorMessage('You must be logged in to create or edit a blog post.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const endpoint = isEditing
        ? `${API_BASE_URL}/api/blogs/${editingBlog.blogId}`
        : `${API_BASE_URL}/api/blogs`

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(responseBody?.message || responseBody?.detail || 'Failed to save blog post.')
        return
      }

      const blogId = responseBody?.blogId ?? editingBlog?.blogId ?? null
      if (blogId) setSavedBlogId(blogId)

      // Upload any queued files immediately after saving
      if (pendingFiles.length && blogId) {
        await uploadPendingFiles(blogId)
      }

      onBlogSaved?.(responseBody)

      if (isEditing) {
        onNavigateBlog?.()
      }
      // For new blog: stay on page so user can manage attachments, then navigate via "Done" button
    } catch (err) {
      console.error('Error saving blog post:', err)
      setErrorMessage('Network error occurred while connecting to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // After new blog is published, show success state with attachment manager
  const isPublished = !isEditing && savedBlogId !== null

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900">
      <BlogNavbar
        currentView="post-blog"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onLogout={onLogout}
      />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
              {isEditing ? 'Edit Blog' : isPublished ? 'Published ✓' : 'Post Blog'}
            </p>
            <button
              type="button"
              onClick={onNavigateBlog}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              {isPublished ? 'Back to Feed' : 'Cancel'}
            </button>
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {isEditing
              ? 'Edit your blog post'
              : isPublished
              ? 'Blog published!'
              : 'Create a new blog post'}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {isPublished
              ? 'Your blog is live. You can also add attachments below before going back to the feed.'
              : 'Share programming insights, algorithmic explanations, tournament writeups, or computer science concepts with the community.'}
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            {!isPublished && (
              <div>
                <label htmlFor="blog-title" className="mb-2 block text-sm font-semibold text-slate-700">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mastering Dynamic Programming on Trees"
                  maxLength={255}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {/* Content */}
            {!isPublished && (
              <div>
                <label htmlFor="blog-content" className="mb-2 block text-sm font-semibold text-slate-700">
                  Blog content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="blog-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full post here. Paragraphs and line breaks are automatically formatted..."
                  rows="12"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 font-sans leading-relaxed"
                />
              </div>
            )}

            {/* ── Attachments section ── */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
                  Attachments
                  {savedAttachments.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-violet-200 px-1.5 py-0.5 text-violet-800">
                      {savedAttachments.length}
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-violet-400">Max 15 MB per file</span>
              </div>

              {/* If blog not yet saved: show file picker that queues files */}
              {!savedBlogId ? (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Add Attachment
                  </button>
                  {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {pendingFiles.map((f) => (
                        <FilePill key={f.name} file={f} onRemove={removePendingFile} />
                      ))}
                    </div>
                  )}
                  {pendingFiles.length === 0 && (
                    <p className="text-[11px] text-violet-400">
                      Files will be uploaded when you publish the blog.
                    </p>
                  )}
                </div>
              ) : (
                /* Blog exists: live upload/manage with AttachmentUploader */
                <AttachmentUploader
                  entityType="blog"
                  entityId={savedBlogId}
                  attachments={savedAttachments}
                  currentUsername={currentUsername}
                  onUploaded={(newAtts) => setSavedAttachments((prev) => [...prev, ...newAtts])}
                  onDeleted={(id) => setSavedAttachments((prev) => prev.filter((a) => a.attachmentId !== id))}
                />
              )}
            </div>

            {/* Actions */}
            {!isPublished && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {pendingFiles.length > 0 ? 'Publishing & Uploading...' : 'Publishing...'}
                    </span>
                  ) : isEditing ? (
                    'Update Post'
                  ) : (
                    'Publish Post'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNavigateBlog}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Post-publish: Done button */}
            {isPublished && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateBlog}
                  className="inline-flex items-center gap-2 justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Done — Back to Feed
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}