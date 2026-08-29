import { useState, useEffect } from 'react'

import LandingPage from './components/LandingPage/LandingPage'
import AuthPage from './components/Auth/AuthPage'
import BlogDashboard from './components/Feed/BlogDashboard'
import ProblemsPage from './components/Feed/ProblemsPage'
import BlogPostPage from './components/Feed/BlogPostPage'
import ProfilePage from './components/Profile/ProfilePage'
import RoadmapPage from './components/Roadmap/RoadmapPage'
import AdminDashboard from './components/Admin/AdminDashboard'
import { createInitialBlogPosts } from './components/Shared/platformContent'

export default function App(props) {
  const [view, setView] = useState('landing')
  const [problemsByTopic, setProblemsByTopic] = useState({})
  const [blogPosts, setBlogPosts] = useState(createInitialBlogPosts)
  const [editingBlog, setEditingBlog] = useState(null)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
        const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/problems` : '/api/problems'
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          const grouped = {}
          data.forEach(p => {
            const topic = p.topic || 'Arrays & Hashing' // default topic if null
            if (!grouped[topic]) {
              grouped[topic] = []
            }
            // Avoid duplicate by ID xyz
            if (!grouped[topic].find(ex => ex.id === p.problemId)) {
              grouped[topic].push({
                id: p.problemId,
                name: p.title,
                difficulty: p.difficulty,
                concept: p.concept,
                judgeUrl: p.externalLink || 'https://codeforces.com/problemset',
                solved: false,
                bookmarked: false,
                notes: '',
              })
            }
          })
          setProblemsByTopic(grouped)
        }
      } catch (err) {
        console.error('Failed to fetch problems', err)
      }
    }
    fetchProblems()
  }, [])

  const handleLogin = (responseBody) => {
    const nextRole = responseBody?.role === 'admin' || responseBody?.username?.toLowerCase?.() === 'admin' ? 'admin' : 'user'
    localStorage.setItem('codesprintRole', nextRole)
    setView(nextRole === 'admin' ? 'admin' : 'feed')
  }

  const handleNavigatePostBlog = () => {
    setEditingBlog(null)
    setView('post-blog')
  }

  const handleEditBlog = (blog) => {
    setEditingBlog(blog)
    setView('post-blog')
  }

  if (view === 'auth') {
    return (
      <AuthPage
        onBackToLanding={() => setView('landing')}
        onLogin={handleLogin}
        {...props}
      />
    )
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        onBackToLanding={() => setView('landing')}
        onNavigateProblems={() => setView('problems')}
        onNavigateBlog={() => setView('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        problemsByTopic={problemsByTopic}
        setProblemsByTopic={setProblemsByTopic}
        blogPosts={blogPosts}
        setBlogPosts={setBlogPosts}
        {...props}
      />
    )
  }

  if (view === 'feed') {
    return (
      <BlogDashboard
        onBackToLanding={() => setView('landing')}
        onNavigateProblems={() => setView('problems')}
        onNavigateBlog={() => setView('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        onEditBlog={handleEditBlog}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  if (view === 'problems') {
    return (
      <ProblemsPage
        onBackToFeed={() => setView('feed')}
        onNavigateProblems={() => setView('problems')}
        onNavigateBlog={() => setView('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        problemsByTopic={problemsByTopic}
        setProblemsByTopic={setProblemsByTopic}
        {...props}
      />
    )
  }

  if (view === 'post-blog') {
    return (
      <BlogPostPage
        onBackToFeed={() => setView('feed')}
        onNavigateProblems={() => setView('problems')}
        onNavigateBlog={() => setView('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        editingBlog={editingBlog}
        onBlogSaved={() => setEditingBlog(null)}
        {...props}
      />
    )
  }

  if (view === 'profile') {
    return (
      <ProfilePage
        onBackToFeed={() => setView('feed')}
        onNavigateProblems={() => setView('problems')}
        onNavigateBlog={() => setView('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  if (view === 'roadmap') {
    return (
      <RoadmapPage
        onNavigateBlog={() => setView('feed')}
        onNavigateProblems={() => setView('problems')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  return <LandingPage {...props} onGetStarted={() => setView('auth')} />
}