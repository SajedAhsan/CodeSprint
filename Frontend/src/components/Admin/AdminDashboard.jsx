import { useMemo, useState } from 'react'

import AdminNavbar from './AdminNavbar'
import ProblemComposer from './ProblemComposer'
import ProblemRegistry from './ProblemRegistry'
import PostManager from './PostManager'
import { createProblemEntry, problemTopics } from '../Shared/platformContent'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.2)] backdrop-blur">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {hint ? <p className="mt-2 text-sm leading-6 text-slate-400">{hint}</p> : null}
    </div>
  )
}

export default function AdminDashboard({
  onBackToLanding,
  onNavigateBlog,
  problemsByTopic,
  setProblemsByTopic,
  blogPosts,
  setBlogPosts,
}) {
  const [currentSection, setCurrentSection] = useState('problems')
  const [selectedTopic, setSelectedTopic] = useState(problemTopics[0])
  const [problemQuery, setProblemQuery] = useState('')
  const [postQuery, setPostQuery] = useState('')
  const [problemForm, setProblemForm] = useState({
    topic: problemTopics[0],
    name: '',
    difficulty: 'Medium',
    concept: '',
    judgeUrl: '',
    premium: false,
  })
  const [problemStatus, setProblemStatus] = useState({ type: '', message: '' })
  const [isSavingProblem, setIsSavingProblem] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    author: 'Admin',
    body: '',
  })

  const totals = useMemo(() => {
    const topicCount = Object.keys(problemsByTopic || {}).length
    const problemCount = Object.values(problemsByTopic || {}).reduce((sum, list) => sum + list.length, 0)

    return {
      topicCount,
      problemCount,
      postCount: blogPosts?.length || 0,
    }
  }, [blogPosts, problemsByTopic])

  const currentProblems = problemsByTopic?.[selectedTopic] || []
  const filteredProblems = currentProblems.filter((problem) => {
    const needle = problemQuery.trim().toLowerCase()
    if (!needle) return true
    return [problem.name, problem.concept, problem.difficulty].some((field) => field.toLowerCase().includes(needle))
  })

  const filteredPosts = (blogPosts || []).filter((post) => {
    const needle = postQuery.trim().toLowerCase()
    if (!needle) return true
    return [post.title, post.author, post.body.join(' ')].some((field) => field.toLowerCase().includes(needle))
  })

  const handleAddProblem = async (event) => {
    event.preventDefault()

    const topic = problemForm.topic.trim()
    const name = problemForm.name.trim()
    const concept = problemForm.concept.trim()
    const judgeUrl = problemForm.judgeUrl.trim()

    if (!topic || !name || !concept) return

    const token = localStorage.getItem('codesprintToken')
    if (!token) {
      setProblemStatus({ type: 'error', message: 'Please sign in again before adding a problem.' })
      return
    }

    setIsSavingProblem(true)
    setProblemStatus({ type: '', message: '' })

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/problems` : '/api/problems'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          title: name,
          externalLink: judgeUrl,
          difficulty: problemForm.difficulty,
          concept,
          premium: Boolean(problemForm.premium),
        }),
      })

      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        const message = responseBody?.message || responseBody?.detail || 'Unable to add problem'
        throw new Error(message)
      }

      const savedProblem = responseBody || {}
      const nextProblem = createProblemEntry({
        id: savedProblem.problemId ?? Date.now(),
        name: savedProblem.title || name,
        difficulty: savedProblem.difficulty || problemForm.difficulty,
        concept: savedProblem.concept || concept,
        judgeUrl: savedProblem.externalLink || judgeUrl || 'https://codeforces.com/problemset',
        solved: false,
        bookmarked: false,
        notes: '',
      })

      setProblemsByTopic((current) => {
        const topicProblems = current[topic] || []

        return {
          ...current,
          [topic]: [
            nextProblem,
            ...topicProblems,
          ],
        }
      })

      setSelectedTopic(topic)
      setProblemForm({
        topic,
        name: '',
        difficulty: 'Medium',
        concept: '',
        judgeUrl: '',
        premium: false,
      })
      setProblemStatus({ type: 'success', message: 'Problem added successfully.' })
    } catch (error) {
      setProblemStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to add problem',
      })
    } finally {
      setIsSavingProblem(false)
    }
  }

  const handleDeleteProblem = async (topic, id) => {
    const token = localStorage.getItem('codesprintToken')
    if (!token) return

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/problems/${id}` : `/api/problems/${id}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Delete failed')

      setProblemsByTopic((current) => ({
        ...current,
        [topic]: (current[topic] || []).filter((problem) => problem.id !== id),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddPost = (event) => {
    event.preventDefault()

    const title = postForm.title.trim()
    const author = postForm.author.trim()
    const body = postForm.body.trim()

    if (!title || !body) return

    setBlogPosts((current) => {
      const nextId = current.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1

      return [
        {
          id: nextId,
          title,
          author: author || 'Admin',
          timePosted: 'Just now',
          body: body.split('\n').map((line) => line.trim()).filter(Boolean),
          comments: [],
          votes: 0,
        },
        ...current,
      ]
    })

    setPostForm({ title: '', author: 'Admin', body: '' })
  }

  const handleDeletePost = (id) => {
    setBlogPosts((current) => current.filter((post) => post.id !== id))
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <AdminNavbar
        currentSection={currentSection}
        onSwitchSection={setCurrentSection}
        onExitAdmin={onBackToLanding}
        onNavigateBlog={onNavigateBlog}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Topics" value={totals.topicCount} hint="The full problem catalog is grouped by topic." />
          <StatCard label="Problems" value={totals.problemCount} hint="Add or remove problems without touching the user view." />
          <StatCard label="Posts" value={totals.postCount} hint="Keep the blog feed clean by removing outdated posts." />
        </div>

        {currentSection === 'composer' && (
          <div className="mt-8">
            <ProblemComposer
              problemForm={problemForm}
              onChange={(field, value) => setProblemForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleAddProblem}
              topics={problemTopics}
              isSubmitting={isSavingProblem}
              statusMessage={problemStatus.message}
              statusType={problemStatus.type}
            />
          </div>
        )}

        {currentSection === 'registry' && (
          <div className="mt-8">
            <ProblemRegistry
              problemQuery={problemQuery}
              onChangeQuery={setProblemQuery}
              topics={problemTopics}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              problemsByTopic={problemsByTopic}
              filteredProblems={filteredProblems}
              onDeleteProblem={handleDeleteProblem}
            />
          </div>
        )}

        {currentSection === 'posts' && (
          <div className="mt-8">
            <PostManager
              postForm={postForm}
              onChange={(field, value) => setPostForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleAddPost}
              postQuery={postQuery}
              onChangeQuery={setPostQuery}
              filteredPosts={filteredPosts}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}

        {currentSection === 'preview' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <ProblemComposer
              problemForm={problemForm}
              onChange={(field, value) => setProblemForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleAddProblem}
              topics={problemTopics}
              isSubmitting={isSavingProblem}
              statusMessage={problemStatus.message}
              statusType={problemStatus.type}
            />
            <PostManager
              postForm={postForm}
              onChange={(field, value) => setPostForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleAddPost}
              postQuery={postQuery}
              onChangeQuery={setPostQuery}
              filteredPosts={filteredPosts}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}
      </section>
    </main>
  )
}