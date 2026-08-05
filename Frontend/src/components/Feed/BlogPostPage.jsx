import { useState } from 'react'

import BlogNavbar from './BlogNavbar'

export default function BlogPostPage({ onNavigateBlog, onNavigateProblems, onNavigatePostBlog, onNavigateProfile, onNavigateRoadmap }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Post Blog</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create a new blog post</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Use this composer to draft a blog post after login. It keeps the writing area simple and focused so the post can be sent into the feed later.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Write your blog title"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Blog content</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the blog post content here"
                rows="10"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Publish Post
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}