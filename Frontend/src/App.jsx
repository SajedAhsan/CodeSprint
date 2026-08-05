import { useState } from 'react'

import LandingPage from './components/LandingPage/LandingPage'
import AuthPage from './components/Auth/AuthPage'
import BlogDashboard from './components/Feed/BlogDashboard'
import ProblemsPage from './components/Feed/ProblemsPage'
import BlogPostPage from './components/Feed/BlogPostPage'
import ProfilePage from './components/Profile/ProfilePage'
import RoadmapPage from './components/Roadmap/RoadmapPage'

export default function App(props) {
  const [view, setView] = useState('landing')

  if (view === 'auth') {
    return (
      <AuthPage
        onBackToLanding={() => setView('landing')}
        onLogin={() => setView('feed')}
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
        onNavigatePostBlog={() => setView('post-blog')}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
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
        onNavigatePostBlog={() => setView('post-blog')}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
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
        onNavigatePostBlog={() => setView('post-blog')}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
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
        onNavigatePostBlog={() => setView('post-blog')}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        {...props}
      />
    )
  }

  if (view === 'roadmap') {
    return (
      <RoadmapPage
        onNavigateBlog={() => setView('feed')}
        onNavigateProblems={() => setView('problems')}
        onNavigatePostBlog={() => setView('post-blog')}
        onNavigateProfile={() => setView('profile')}
        onNavigateRoadmap={() => setView('roadmap')}
        {...props}
      />
    )
  }

  return <LandingPage {...props} onGetStarted={() => setView('auth')} />
}