import { useState, useEffect } from 'react'
import BlogNavbar from '../Feed/BlogNavbar'
import defaultAvatar from '../../assets/default-avatar.png'

/* ════════════════════════════════════════════════════════════
   SVG Donut Progress Chart
════════════════════════════════════════════════════════════ */
function OverallProgressChart({ easy = 0, medium = 0, hard = 0, totalProblems = 0 }) {
  const totalSolved = easy + medium + hard
  const total = totalProblems > 0 ? totalProblems : Math.max(totalSolved, 1)

  // SVG donut parameters
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? Math.min(totalSolved / total, 1) : 0
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Overall Progress</h3>
      </div>

      <div className="flex items-center gap-8 lg:gap-12">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Track */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="#22c55e" strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-900 leading-none">{totalSolved}</span>
            <span className="text-xs text-slate-400 font-medium mt-1">/{totalProblems}</span>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Solved
            </span>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="flex flex-col justify-center gap-4 flex-1">
          {/* Easy */}
          <div className="rounded-xl bg-slate-50 py-3 text-center transition hover:bg-emerald-50/50">
            <p className="text-[13px] font-bold text-teal-500 uppercase tracking-wider leading-none">Easy</p>
            <p className="text-lg font-extrabold text-slate-800 mt-1.5">{easy}</p>
          </div>
          {/* Medium */}
          <div className="rounded-xl bg-slate-50 py-3 text-center transition hover:bg-amber-50/50">
            <p className="text-[13px] font-bold text-amber-500 uppercase tracking-wider leading-none">Medium</p>
            <p className="text-lg font-extrabold text-slate-800 mt-1.5">{medium}</p>
          </div>
          {/* Hard */}
          <div className="rounded-xl bg-slate-50 py-3 text-center transition hover:bg-rose-50/50">
            <p className="text-[13px] font-bold text-rose-500 uppercase tracking-wider leading-none">Hard</p>
            <p className="text-lg font-extrabold text-slate-800 mt-1.5">{hard}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   Main Profile Page
════════════════════════════════════════════════════════════ */
export default function ProfilePage({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onLogout,
}) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const userId = localStorage.getItem('codesprintUserId')
        const username = localStorage.getItem('codesprintUsername')
        const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')

        const headers = { Accept: 'application/json' }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        let endpoint = '/api/users/profile'
        if (userId && userId !== 'null' && userId !== 'undefined') {
          endpoint = `/api/users/profile/${userId}`
        } else if (username && username !== 'null' && username !== 'undefined') {
          endpoint = `/api/users/profile/${encodeURIComponent(username)}`
        }

        const res = await fetch(endpoint, { headers })
        if (!res.ok) {
          throw new Error('Failed to load profile details')
        }

        const data = await res.json()
        if (isMounted) {
          setProfile(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error loading profile')
          // Fallback basic user if offline or error
          const fallbackUsername = localStorage.getItem('codesprintUsername') || 'User'
          setProfile({
            username: fallbackUsername,
            totalLikes: 0,
            upvotes: 0,
            solves: { easy: 0, medium: 0, hard: 0 },
            totalSolved: 0,
            totalProblems: 0,
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const username = profile?.username || localStorage.getItem('codesprintUsername') || 'User'
  const totalLikes = profile?.totalLikes ?? 0
  const upvotes = profile?.upvotes ?? 0
  const solves = profile?.solves || { easy: 0, medium: 0, hard: 0 }
  const totalProblems = profile?.totalProblems ?? 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900 pb-20">
      <BlogNavbar
        currentView="profile"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onLogout={onLogout}
      />

      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Hero Section ── */}
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl mb-8 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-100 to-indigo-50 p-2 shadow-lg">
                <img src={defaultAvatar} alt={username} className="w-full h-full rounded-[1.5rem] object-cover bg-white" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-full shadow-md">
                <div className="bg-emerald-500 w-5 h-5 rounded-full border-2 border-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Only show username (no @name underneath) */}
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{username}</h1>
              
              {/* Badges / Quick Stats */}
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  {loading ? '...' : totalLikes} Total Likes
                </div>
                
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  {loading ? '...' : upvotes} Upvotes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-12 text-center text-slate-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3" />
              <p className="text-sm font-medium">Loading stats from database...</p>
            </div>
          ) : (
            <OverallProgressChart
              easy={solves.easy}
              medium={solves.medium}
              hard={solves.hard}
              totalProblems={totalProblems}
            />
          )}
        </div>
      </section>
    </main>
  )
}
