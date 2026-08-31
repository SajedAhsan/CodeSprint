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

const VIEW_TO_PATH = {
  landing: '/',
  auth: '/auth',
  feed: '/feed',
  problems: '/problems',
  'post-blog': '/post-blog',
  profile: '/profile',
  roadmap: '/roadmap',
  admin: '/admin',
}

const PATH_TO_VIEW = {
  '/': 'landing',
  '/landing': 'landing',
  '/auth': 'auth',
  '/login': 'auth',
  '/signup': 'auth',
  '/feed': 'feed',
  '/blog': 'feed',
  '/blogs': 'feed',
  '/problems': 'problems',
  '/problem': 'problems',
  '/post-blog': 'post-blog',
  '/create-blog': 'post-blog',
  '/profile': 'profile',
  '/roadmap': 'roadmap',
  '/admin': 'admin',
}

function getInitialView() {
  if (typeof window === 'undefined') return 'landing'

  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  if (PATH_TO_VIEW[path]) {
    return PATH_TO_VIEW[path]
  }

  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '')
  if (hash && PATH_TO_VIEW[`/${hash}`]) {
    return PATH_TO_VIEW[`/${hash}`]
  }

  const saved = localStorage.getItem('codesprint_current_view')
  if (saved && VIEW_TO_PATH[saved]) {
    return saved
  }

  return 'landing'
}

export default function App(props) {
  const [view, setView] = useState(getInitialView)
  const [problemsByTopic, setProblemsByTopic] = useState({})
  const [blogPosts, setBlogPosts] = useState(createInitialBlogPosts)
  const [editingBlog, setEditingBlog] = useState(null)

  const navigate = (nextView, replace = false) => {
    setView(nextView)
    const nextPath = VIEW_TO_PATH[nextView] || '/'
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
      if (currentPath !== nextPath) {
        if (replace) {
          window.history.replaceState({ view: nextView }, '', nextPath)
        } else {
          window.history.pushState({ view: nextView }, '', nextPath)
        }
      }
      localStorage.setItem('codesprint_current_view', nextView)
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
      const matched = PATH_TO_VIEW[path]
      if (matched) {
        setView(matched)
        localStorage.setItem('codesprint_current_view', matched)
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Ensure the initial browser URL matches the active view
    const initialPath = VIEW_TO_PATH[view] || '/'
    const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
    if (currentPath !== initialPath) {
      window.history.replaceState({ view }, '', initialPath)
    }
    localStorage.setItem('codesprint_current_view', view)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogin = (responseBody) => {
    const nextRole = responseBody?.role === 'admin' || responseBody?.username?.toLowerCase?.() === 'admin' ? 'admin' : 'user'
    localStorage.setItem('codesprintRole', nextRole)
    navigate(nextRole === 'admin' ? 'admin' : 'feed')
  }

  const handleNavigatePostBlog = () => {
    setEditingBlog(null)
    navigate('post-blog')
  }

  const handleEditBlog = (blog) => {
    setEditingBlog(blog)
    navigate('post-blog')
  }

  if (view === 'auth') {
    return (
      <AuthPage
        onBackToLanding={() => navigate('landing')}
        onLogin={handleLogin}
        {...props}
      />
    )
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        onBackToLanding={() => navigate('landing')}
        onNavigateProblems={() => navigate('problems')}
        onNavigateBlog={() => navigate('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
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
        onBackToLanding={() => navigate('landing')}
        onNavigateProblems={() => navigate('problems')}
        onNavigateBlog={() => navigate('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
        onEditBlog={handleEditBlog}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  if (view === 'problems') {
    return (
      <ProblemsPage
        onBackToFeed={() => navigate('feed')}
        onNavigateProblems={() => navigate('problems')}
        onNavigateBlog={() => navigate('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
        problemsByTopic={problemsByTopic}
        setProblemsByTopic={setProblemsByTopic}
        {...props}
      />
    )
  }

  if (view === 'post-blog') {
    return (
      <BlogPostPage
        onBackToFeed={() => navigate('feed')}
        onNavigateProblems={() => navigate('problems')}
        onNavigateBlog={() => navigate('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
        editingBlog={editingBlog}
        onBlogSaved={() => setEditingBlog(null)}
        {...props}
      />
    )
  }

  if (view === 'profile') {
    return (
      <ProfilePage
        onBackToFeed={() => navigate('feed')}
        onNavigateProblems={() => navigate('problems')}
        onNavigateBlog={() => navigate('feed')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  if (view === 'roadmap') {
    return (
      <RoadmapPage
        onNavigateBlog={() => navigate('feed')}
        onNavigateProblems={() => navigate('problems')}
        onNavigatePostBlog={handleNavigatePostBlog}
        onNavigateProfile={() => navigate('profile')}
        onNavigateRoadmap={() => navigate('roadmap')}
        blogPosts={blogPosts}
        {...props}
      />
    )
  }

  return <LandingPage {...props} onGetStarted={() => navigate('auth')} />
}