import { useState, useEffect, useMemo } from 'react'
import blogHeroImg from '../../assets/LandingPage/blog.png'
import BlogNavbar from './BlogNavbar'
import BlogCard from './BlogCard'

function getAuthHeaders() {
  const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export default function BlogDashboard({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onNavigateRoadmap,
  onEditBlog,
}) {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchBlogs = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/blogs` : '/api/blogs'
      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        setBlogs(Array.isArray(data) ? data : [])
      } else {
        setErrorMessage('Failed to load blog posts from the server.')
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      setErrorMessage('Could not connect to the server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleBlogUpdated = (updatedBlog) => {
    setBlogs((prev) =>
      prev.map((b) => (b.blogId === updatedBlog.blogId ? { ...b, ...updatedBlog } : b)),
    )
  }

  const handleDeleteBlog = (deletedBlogId) => {
    setBlogs((prev) => prev.filter((b) => b.blogId !== deletedBlogId))
  }

  // Filtered blogs by search query
  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return blogs
    return blogs.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(query)) ||
        (b.content && b.content.toLowerCase().includes(query)) ||
        (b.authorUsername && b.authorUsername.toLowerCase().includes(query)),
    )
  }, [blogs, searchQuery])

  // Live computed stats
  const quickStats = useMemo(() => {
    const totalBlogs = blogs.length
    const totalLikes = blogs.reduce((acc, b) => acc + (b.likeCount || 0), 0)
    const totalComments = blogs.reduce((acc, b) => acc + (b.commentCount || 0), 0)

    return [
      { label: 'Published Blogs', value: totalBlogs },
      { label: 'Community Likes', value: totalLikes },
      { label: 'Discussion Comments', value: totalComments },
    ]
  }, [blogs])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_24%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900">
      <BlogNavbar
        currentView="blog"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onNavigateRoadmap={onNavigateRoadmap}
      />

      {/* Hero Banner */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3">
                <p className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Community Feed
                </p>
              </div>

              <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Read, comment, and vote on the latest blog posts in one focused workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Explore programming articles, problem breakdowns, algorithmic intuition, and developer discussions shared by the CodeSprint community.
              </p>

              {/* Action row & Stats */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigatePostBlog}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Create New Blog
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-blue-100 bg-blue-50/70 px-4 py-4">
                    <p className="text-2xl font-semibold text-blue-700">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.38))]" />
            <img
              src={blogHeroImg}
              alt="Blog workspace illustration"
              className="relative z-10 h-full w-full rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feed Controls (Search / Filter) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-400" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs by title, author, or content..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchBlogs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Refresh feeds"
            >
              <svg viewBox="0 0 24 24" fill="none" className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Feed List */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="h-5 w-24 rounded-full bg-blue-100 mb-3" />
                <div className="h-7 w-3/4 rounded-xl bg-slate-200 mb-4" />
                <div className="h-4 w-1/3 rounded-lg bg-slate-100 mb-6" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded-lg bg-slate-100" />
                  <div className="h-4 w-5/6 rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50/70 p-8 text-center shadow-sm">
            <p className="text-rose-700 font-semibold mb-2">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchBlogs}
              className="mt-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white/80 p-12 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              {searchQuery ? 'No matching blogs found' : 'No blogs published yet'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `No posts matched "${searchQuery}". Try a different keyword.`
                : 'Be the first to share your programming journey, algorithm writeups, or tips!'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onNavigatePostBlog}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Create the First Blog
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBlogs.map((post) => (
              <BlogCard
                key={post.blogId || post.id}
                post={post}
                onEditBlog={onEditBlog}
                onDeleteBlog={handleDeleteBlog}
                onBlogUpdated={handleBlogUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}