import { useState, useEffect } from 'react'
import BlogNavbar from './BlogNavbar'

function getAuthHeaders() {
  const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export default function BlogPostPage({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onNavigateRoadmap,
  editingBlog = null,
  onBlogSaved,
}) {
  const [title, setTitle] = useState(editingBlog ? editingBlog.title : '')
  const [content, setContent] = useState(editingBlog ? (editingBlog.content || (Array.isArray(editingBlog.body) ? editingBlog.body.join('\n\n') : '')) : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (editingBlog) {
      setTitle(editingBlog.title || '')
      setContent(editingBlog.content || (Array.isArray(editingBlog.body) ? editingBlog.body.join('\n\n') : ''))
    } else {
      setTitle('')
      setContent('')
    }
    setErrorMessage('')
  }, [editingBlog])

  const isEditing = Boolean(editingBlog && editingBlog.blogId)

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

    const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
    if (!token) {
      setErrorMessage('You must be logged in to create or edit a blog post.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = isEditing
        ? (API_BASE_URL ? `${API_BASE_URL}/api/blogs/${editingBlog.blogId}` : `/api/blogs/${editingBlog.blogId}`)
        : (API_BASE_URL ? `${API_BASE_URL}/api/blogs` : '/api/blogs')

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
        }),
      })

      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(responseBody?.message || responseBody?.detail || 'Failed to save blog post.')
        return
      }

      onBlogSaved?.(responseBody)
      onNavigateBlog?.()
    } catch (err) {
      console.error('Error saving blog post:', err)
      setErrorMessage('Network error occurred while connecting to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900">
      <BlogNavbar
        currentView="post-blog"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onNavigateRoadmap={onNavigateRoadmap}
      />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
              {isEditing ? 'Edit Blog' : 'Post Blog'}
            </p>
            <button
              type="button"
              onClick={onNavigateBlog}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {isEditing ? 'Edit your blog post' : 'Create a new blog post'}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Share programming insights, algorithmic explanations, tournament writeups, or computer science concepts with the community.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="blog-title" className="mb-2 block text-sm font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="blog-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Mastering Dynamic Programming on Trees"
                maxLength={255}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="blog-content" className="mb-2 block text-sm font-semibold text-slate-700">
                Blog content <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="blog-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the full post here. Paragraphs and line breaks are automatically formatted..."
                rows="12"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 font-sans leading-relaxed"
              />
            </div>

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
                    Publishing...
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
          </form>
        </div>
      </section>
    </main>
  )
}