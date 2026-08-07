import blogHeroImg from '../../assets/LandingPage/blog.png'
import { blogPosts as defaultBlogPosts, quickStats } from './blogFeedContent'
import BlogNavbar from './BlogNavbar'
import BlogCard from './BlogCard'

export default function BlogDashboard({ onNavigateBlog, onNavigateProblems, onNavigatePostBlog, onNavigateProfile, onNavigateRoadmap, blogPosts }) {
  const visiblePosts = blogPosts || defaultBlogPosts

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

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                After login feed
              </p>
              <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Read, comment, and vote on the latest blog posts in one focused workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                The page keeps the interface minimal: title, author, and time are front and center, while comment and voting actions stay available in blue for quick interaction.
              </p>

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

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid gap-6">
          {visiblePosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  )
}