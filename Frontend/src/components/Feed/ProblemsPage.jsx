import { useEffect, useState, Fragment } from 'react'
import BlogNavbar from './BlogNavbar'
import ProblemPage from '../Problem/ProblemPage'

/* ─── Topic list ─── */
const problemTopics = [
  'Basic Problems', 'Prefix Sum', 'Sliding Window', 'Two pointer',
  'Sorting', 'Binary Search', 'Bit Manupulation', 'Dynamic Programming',
  'Minimum Spanning Tree', 'Topological Sort', 'Shortest Path',
  'BFS', 'DFS', 'Range Queries', 'Tree Algorithms',
  'Mathematics', 'String Algorithms', 'Geometry',
]

const getLoggedInUserId = () => {
  const localUserId = Number(localStorage.getItem('codesprintUserId'))
  if (Number.isFinite(localUserId) && localUserId > 0) {
    return localUserId
  }

  const token = localStorage.getItem('codesprintToken')
  if (!token) return null

  try {
    const tokenPayload = token.split('.')[1] || ''
    const normalized = tokenPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    const decodedUserId = Number(payload.userId ?? payload.user_id)
    return Number.isFinite(decodedUserId) && decodedUserId > 0 ? decodedUserId : null
  } catch {
    return null
  }
}

const persistProblemState = async (problemId, statePatch) => {
  const userId = getLoggedInUserId()
  const token = localStorage.getItem('codesprintToken')
  if (!userId || !problemId) {
    console.warn('Problem state not persisted: missing valid userId or problemId')
    return
  }

  if (!token) {
    console.warn('Problem state not persisted: missing auth token')
    return
  }

  try {
    const payload = {
      note: typeof statePatch?.note === 'string'
        ? statePatch.note
        : typeof statePatch?.notes === 'string'
          ? statePatch.notes
          : '',
      bookmark: typeof statePatch?.bookmark === 'boolean'
        ? statePatch.bookmark
        : Boolean(statePatch?.bookmarked),
      solved: typeof statePatch?.solved === 'boolean'
        ? statePatch.solved
        : Boolean(statePatch?.solved),
    }

    const response = await fetch(`/api/user-problems/${userId}/${problemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to save problem state: ${response.status}`)
    }
  } catch (error) {
    console.error('Error saving problem state:', error)
  }
}

/* ─── Helper to build default solution + discussion for any problem ─── */
function buildMeta(name, concept, judgeUrl) {
  return {
    judgeUrl: judgeUrl || 'https://codeforces.com/problemset',
    solution: {
      explanation: `This is the editorial for "${name}". The key insight revolves around ${concept}. We iterate through the data structure once, maintaining state to achieve an optimal O(n) or O(n log n) solution.`,
      codes: {
        'C++': `#include <bits/stdc++.h>
using namespace std;

// Solution for: ${name}
// Concepts: ${concept}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // --- core logic here ---

    return 0;
}`,
        'Java': `import java.util.*;
import java.io.*;

// Solution for: ${name}
// Concepts: ${concept}
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // --- core logic here ---

        sc.close();
    }
}`,
        'Python': `import sys
input = sys.stdin.readline

# Solution for: ${name}
# Concepts: ${concept}
def solve():
    # --- core logic here ---
    pass

solve()`,
      },
      video: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    },
    discussion: [
      {
        id: 10000 + name.charCodeAt(0),
        username: 'Aanya',
        time: '5h ago',
        comment: `Great problem! The core trick is understanding ${concept}. Once you see it, the implementation follows naturally.`,
        likes: 11,
        replies: [
          {
            id: 20000 + name.charCodeAt(0),
            username: 'Rohit',
            time: '3h ago',
            comment: 'Totally agree. I initially over-complicated it, but the greedy observation simplifies everything.',
            likes: 4,
            replies: [],
          },
        ],
      },
    ],
  }
}

/* ─── Seeded problems ─── */
const seedProblems = {
  'Basic Problems': [
    { id: 1, name: '1. Three Activities', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Greedy, Sorting, Brute Force', ...buildMeta('Three Activities', 'Greedy, Sorting', 'https://codeforces.com/problemset/problem/1914/D') },
    { id: 2, name: '2. Make Almost Equal With Mod', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Math, Number Theory, Binary Search', ...buildMeta('Make Almost Equal With Mod', 'Math, Number Theory', 'https://codeforces.com/problemset/problem/1910/B') },
    { id: 3, name: '3. Plus Minus Permutation', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Math, Number Theory, GCD', ...buildMeta('Plus Minus Permutation', 'Math, GCD', 'https://codeforces.com/problemset/problem/1872/D') },
    { id: 4, name: '4. Assembly via Minimums', difficulty: 'Medium', solved: true, bookmarked: false, notes: '', concept: 'Greedy, Constructive Algorithms, Sorting', ...buildMeta('Assembly via Minimums', 'Greedy, Constructive', 'https://codeforces.com/problemset/problem/1857/C') },
    { id: 5, name: '5. Vika and the Bridge', difficulty: 'Medium', solved: true, bookmarked: false, notes: '', concept: 'Binary Search, Greedy, Two Pointers', ...buildMeta('Vika and the Bridge', 'Binary Search, Greedy', 'https://codeforces.com/problemset/problem/1848/B') },
    { id: 6, name: '6. Contrast Value', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Greedy, Two Pointers, Implementation', ...buildMeta('Contrast Value', 'Greedy, Two Pointers', 'https://codeforces.com/problemset/problem/1837/D') },
    { id: 7, name: '7. Playing in a Casino', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Math, Sorting, Greedy', ...buildMeta('Playing in a Casino', 'Math, Sorting', 'https://codeforces.com/problemset/problem/1808/B') },
    { id: 8, name: '8. Dora and Search', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Two Pointers, Greedy, Constructive Algorithms', ...buildMeta('Dora and Search', 'Two Pointers, Greedy', 'https://codeforces.com/problemset/problem/1793/C') },
    { id: 9, name: '9. Matryoshkas', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Greedy, Sorting, Data Structures', ...buildMeta('Matryoshkas', 'Greedy, Data Structures', 'https://codeforces.com/problemset/problem/1790/D') },
    { id: 10, name: '10. Scuza', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Binary Search, Prefix Sums, Two Pointers', ...buildMeta('Scuza', 'Binary Search, Prefix Sum', 'https://codeforces.com/problemset/problem/1742/E') },
    { id: 11, name: '11. Removing Smallest Multiples', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Math, Number Theory, Sieve of Eratosthenes', ...buildMeta('Removing Smallest Multiples', 'Math, Sieve', 'https://codeforces.com/problemset/problem/1734/C') },
  ],
  'Prefix Sum': [
    { id: 1, name: '1. Static Range Sum Queries', difficulty: 'Easy', solved: false, bookmarked: false, notes: '', concept: 'Prefix Sums', ...buildMeta('Static Range Sum Queries', 'Prefix Sums', 'https://cses.fi/problemset/task/1646') },
    { id: 2, name: '2. Subarray Sum Equals K', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Prefix Sums, Hash Map', ...buildMeta('Subarray Sum Equals K', 'Prefix Sums, Hash Map', 'https://codeforces.com/problemset/problem/1398/C') },
    { id: 3, name: '3. Breed Counting', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Prefix Sums, Multi-Dimensional Array', ...buildMeta('Breed Counting', 'Prefix Sums 2D', 'https://codeforces.com/problemset/problem/1118/B') },
    { id: 4, name: '4. Subarray Divisibility', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Prefix Sums, Math, Modulo', ...buildMeta('Subarray Divisibility', 'Prefix Sums, Modulo', 'https://codeforces.com/problemset/problem/1352/E') },
    { id: 5, name: '5. Max Value Array Range Updates', difficulty: 'Hard', solved: false, bookmarked: false, notes: '', concept: 'Prefix Sums, Difference Array', ...buildMeta('Max Value Array Range Updates', 'Difference Array', 'https://codeforces.com/problemset/problem/166E') },
  ],
  'Sliding Window': [
    { id: 1, name: '1. Maximum Average Subarray I', difficulty: 'Easy', solved: false, bookmarked: false, notes: '', concept: 'Sliding Window', ...buildMeta('Maximum Average Subarray I', 'Sliding Window', 'https://codeforces.com/problemset/problem/1203/B') },
    { id: 2, name: '2. Longest Substring Without Repeating Characters', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Sliding Window, Hash Map', ...buildMeta('Longest Substring Without Repeating Characters', 'Sliding Window, Hash Map', 'https://codeforces.com/problemset/problem/1327/B') },
    { id: 3, name: '3. Minimum Window Substring', difficulty: 'Hard', solved: false, bookmarked: false, notes: '', concept: 'Sliding Window, Two Pointers, Frequency Map', ...buildMeta('Minimum Window Substring', 'Sliding Window, Frequency Map', 'https://codeforces.com/problemset/problem/165C') },
    { id: 4, name: '4. Sliding Window Maximum', difficulty: 'Hard', solved: false, bookmarked: false, notes: '', concept: 'Sliding Window, Monotonic Deque', ...buildMeta('Sliding Window Maximum', 'Monotonic Deque', 'https://codeforces.com/problemset/problem/377A') },
  ],
  'Two pointer': [
    { id: 1, name: '1. Two Sum II - Sorted Input', difficulty: 'Easy', solved: false, bookmarked: false, notes: '', concept: 'Two Pointers, Binary Search', ...buildMeta('Two Sum II', 'Two Pointers', 'https://codeforces.com/problemset/problem/70A') },
    { id: 2, name: '2. 3Sum', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Two Pointers, Sorting', ...buildMeta('3Sum', 'Two Pointers, Sorting', 'https://codeforces.com/problemset/problem/1807/G') },
    { id: 3, name: '3. Container With Most Water', difficulty: 'Medium', solved: false, bookmarked: false, notes: '', concept: 'Two Pointers, Greedy', ...buildMeta('Container With Most Water', 'Two Pointers, Greedy', 'https://codeforces.com/problemset/problem/1638/C') },
    { id: 4, name: '4. Trapping Rain Water', difficulty: 'Hard', solved: false, bookmarked: false, notes: '', concept: 'Two Pointers, Monotonic Stack', ...buildMeta('Trapping Rain Water', 'Two Pointers, Monotonic Stack', 'https://codeforces.com/problemset/problem/1157/C2') },
  ],
}

/* ─── Build full map including generic topics ─── */
const initializeAllProblems = () => {
  const map = {}
  Object.entries(seedProblems).forEach(([topic, list]) => {
    map[topic] = list.map((p) => ({ ...p }))
  })
  problemTopics.forEach((topic) => {
    if (map[topic]) return
    map[topic] = Array.from({ length: 11 }, (_, i) => {
      const id = i + 1
      const difficulty = i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard'
      const concept = `${topic}, Algorithm Design`
      return {
        id,
        name: `${id}. ${topic} Problem ${id}`,
        difficulty,
        solved: false,
        bookmarked: false,
        notes: '',
        concept,
        ...buildMeta(`${topic} Problem ${id}`, concept, 'https://codeforces.com/problemset'),
      }
    })
  })
  return map
}

/* ════════════════════════════════════════════════════════════
   SVG Donut Progress Chart
════════════════════════════════════════════════════════════ */
function ProgressChart({ topicName, problems }) {
  const total = problems.length
  const solved = problems.filter((p) => p.solved).length

  const easy = problems.filter((p) => p.difficulty === 'Easy')
  const medium = problems.filter((p) => p.difficulty === 'Medium')
  const hard = problems.filter((p) => p.difficulty === 'Hard')

  const easySolved = easy.filter((p) => p.solved).length
  const mediumSolved = medium.filter((p) => p.solved).length
  const hardSolved = hard.filter((p) => p.solved).length

  // SVG donut parameters
  const size = 140
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? solved / total : 0
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm self-start lg:sticky lg:top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-slate-800">Progress</h3>
        <button
          type="button"
          title="Refresh"
          className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
      </div>

      {/* Topic name */}
      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-4 truncate">{topicName}</p>

      {/* Chart + breakdown layout */}
      <div className="flex items-center gap-5">
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
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{solved}</span>
            <span className="text-[11px] text-slate-400 font-medium">/{total}</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Solved
            </span>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="flex flex-col justify-center gap-3 flex-1">
          {/* Easy */}
          <div className="rounded-[10px] bg-slate-50/80 py-2 text-center">
            <p className="text-[12px] font-medium text-teal-500 leading-none">Easy</p>
            <p className="text-[13px] text-slate-800 mt-1">{easySolved}/{easy.length}</p>
          </div>
          {/* Medium */}
          <div className="rounded-[10px] bg-slate-50/80 py-2 text-center">
            <p className="text-[12px] font-medium text-amber-500 leading-none">Med.</p>
            <p className="text-[13px] text-slate-800 mt-1">{mediumSolved}/{medium.length}</p>
          </div>
          {/* Hard */}
          <div className="rounded-[10px] bg-slate-50/80 py-2 text-center">
            <p className="text-[12px] font-medium text-rose-500 leading-none">Hard</p>
            <p className="text-[13px] text-slate-800 mt-1">{hardSolved}/{hard.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ProblemsPage
════════════════════════════════════════════════════════════ */
export default function ProblemsPage({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onLogout,
  problemsByTopic: controlledProblemsByTopic,
  setProblemsByTopic: controlledSetProblemsByTopic,
}) {
  const [selectedTopic, setSelectedTopic] = useState('Basic Problems')
  const [localProblemsByTopic, setLocalProblemsByTopic] = useState(initializeAllProblems)
  const [activeProblem, setActiveProblem] = useState(null)
  const [topics, setTopics] = useState(problemTopics)
  const [loadingProblems, setLoadingProblems] = useState(true)
  const [initialTab, setInitialTab] = useState('Discussion')
  const [openNotesId, setOpenNotesId] = useState(null)
  const [openConceptId, setOpenConceptId] = useState(null)

  const hasControlledData = controlledProblemsByTopic && Object.keys(controlledProblemsByTopic).length > 0
  const problemsByTopic = hasControlledData ? controlledProblemsByTopic : localProblemsByTopic
  const setProblemsByTopic = (updater) => {
    setLocalProblemsByTopic(updater)
    if (typeof controlledSetProblemsByTopic === 'function') {
      controlledSetProblemsByTopic(updater)
    }
  }

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoadingProblems(true)

        const userId = getLoggedInUserId()
        const token = localStorage.getItem('codesprintToken') || localStorage.getItem('token')
        const headers = { Accept: 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const endpoint = userId ? `/api/problems/page/${userId}` : '/api/problems'
        const response = await fetch(endpoint, { headers })
        if (!response.ok) throw new Error('Unable to load problems')

        const payload = await response.json()
        const grouped = {}

        if (userId && Array.isArray(payload?.topics)) {
          payload.topics.forEach((topic) => {
            const topicName = topic.topicName || 'Basic Problems'
            if (!grouped[topicName]) grouped[topicName] = []

            topic.problems.forEach((problem) => {
              grouped[topicName].push({
                id: problem.problemId,
                name: problem.title,
                difficulty: problem.difficulty || 'Medium',
                solved: Boolean(problem.userState?.solved),
                bookmarked: Boolean(problem.userState?.bookmark || problem.userState?.bookmarked),
                notes: problem.userState?.note || '',
                concept: problem.description || '',
                judgeUrl: problem.externalLink || 'https://codeforces.com/problemset',
                solution: {
                  explanation: problem.description || 'No description provided yet.',
                  codes: {},
                  video: null,
                },
              })
            })
          })
        } else {
          payload.forEach((problem) => {
            const topicName = problem.topic || 'Basic Problems'
            if (!grouped[topicName]) grouped[topicName] = []

            let solution = null
            if (problem.solution) {
              const codes = {}
              if (Array.isArray(problem.solution.solutions)) {
                problem.solution.solutions.forEach((s) => {
                  if (s.language) codes[s.language] = s.code || ''
                })
              }
              solution = {
                explanation: problem.solution.explanation || '',
                codes: Object.keys(codes).length ? codes : (problem.solution.code ? { [problem.solution.language || 'Code']: problem.solution.code } : {}),
                video: problem.solution.videoLink || problem.solution.video || null,
              }
            }

            grouped[topicName].push({
              id: problem.problemId,
              name: problem.title,
              difficulty: problem.difficulty || 'Medium',
              solved: false,
              bookmarked: false,
              notes: '',
              concept: problem.concept || '',
              judgeUrl: problem.externalLink || 'https://codeforces.com/problemset',
              solution,
            })
          })
        }

        const nextTopics = Object.keys(grouped).filter((topic) => grouped[topic].length > 0)
        const nextProblemsByTopic = Object.keys(grouped).length > 0 ? grouped : initializeAllProblems()

        setTopics(nextTopics.length > 0 ? nextTopics : problemTopics)
        setProblemsByTopic(nextProblemsByTopic)

        if (nextTopics.length > 0 && !nextTopics.includes(selectedTopic)) {
          setSelectedTopic(nextTopics[0])
        }

        // Restore active problem / solution from URL query params (e.g. ?id=4&tab=Solution)
        const searchParams = new URLSearchParams(window.location.search)
        const urlProblemId = Number(searchParams.get('id') || searchParams.get('problemId'))
        const urlTab = searchParams.get('tab') || 'Discussion'

        if (urlProblemId) {
          for (const [topName, probList] of Object.entries(nextProblemsByTopic)) {
            const matched = probList.find((p) => p.id === urlProblemId)
            if (matched) {
              setActiveProblem(matched)
              setInitialTab(urlTab === 'Solution' ? 'Solution' : 'Discussion')
              setSelectedTopic(topName)
              break
            }
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingProblems(false)
      }
    }

    loadProblems()
  }, [])

  // Listen to popstate (browser Back/Forward) to toggle problem view or problem list
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const urlProblemId = Number(searchParams.get('id') || searchParams.get('problemId'))
      const urlTab = searchParams.get('tab') || 'Discussion'

      if (urlProblemId && problemsByTopic) {
        for (const [topName, probList] of Object.entries(problemsByTopic)) {
          const matched = probList.find((p) => p.id === urlProblemId)
          if (matched) {
            setActiveProblem(matched)
            setInitialTab(urlTab === 'Solution' ? 'Solution' : 'Discussion')
            setSelectedTopic(topName)
            return
          }
        }
      } else {
        setActiveProblem(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [problemsByTopic])

  /* ── Topic-level helpers ── */
  const updateRow = (id, patch) => {
    const currentTopicProblems = problemsByTopic[selectedTopic] || []
    const currentProblem = currentTopicProblems.find((p) => p.id === id)
    if (!currentProblem) return

    const nextProblem = { ...currentProblem, ...patch }
    const nextState = {
      note: typeof nextProblem.notes === 'string' ? nextProblem.notes : '',
      bookmark: Boolean(nextProblem.bookmarked),
      solved: Boolean(nextProblem.solved),
    }

    setProblemsByTopic((prev) => ({
      ...prev,
      [selectedTopic]: (prev[selectedTopic] || []).map((p) => (p.id === id ? nextProblem : p)),
    }))

    void persistProblemState(id, nextState)
  }

  const toggleStatus = (id) => {
    const currentProblem = problemsByTopic[selectedTopic]?.find((p) => p.id === id)
    if (!currentProblem) return
    updateRow(id, { solved: !currentProblem.solved })
  }

  const toggleBookmark = (id) => {
    const currentProblem = problemsByTopic[selectedTopic]?.find((p) => p.id === id)
    if (!currentProblem) return
    updateRow(id, { bookmarked: !currentProblem.bookmarked })
  }

  const updateNotes = (id, notes) => updateRow(id, { notes })

  /* ── Navigation to ProblemPage ── */
  const openProblemWithTab = (row, tab = 'Discussion') => {
    setInitialTab(tab)
    setActiveProblem(row)
    const url = `/problems?id=${row.id}&tab=${tab}`
    window.history.pushState({ view: 'problems', problemId: row.id, tab }, '', url)
  }

  const handleBackFromProblem = () => {
    setActiveProblem(null)
    window.history.pushState({ view: 'problems' }, '', '/problems')
  }

  /* ── Called by ProblemPage when discussion/solution changes ── */
  const handleUpdateProblem = (updatedProblem) => {
    setProblemsByTopic((prev) => ({
      ...prev,
      [selectedTopic]: (prev[selectedTopic] || []).map((p) =>
        p.id === updatedProblem.id ? updatedProblem : p,
      ),
    }))
    setActiveProblem(updatedProblem)
  }

  const currentProblems = problemsByTopic[selectedTopic] || []
  const hasProblemsForSelectedTopic = currentProblems.length > 0

  /* ── Render ProblemPage if a problem is selected ── */
  if (activeProblem) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900">
        <BlogNavbar
          currentView="problems"
          onNavigateBlog={onNavigateBlog}
          onNavigateProblems={onNavigateProblems}
          onNavigatePostBlog={onNavigatePostBlog}
          onNavigateProfile={onNavigateProfile}
          onLogout={onLogout}
        />
        <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <ProblemPage
            onBack={handleBackFromProblem}
            initialTab={initialTab}
            problem={activeProblem}
            onUpdateProblem={handleUpdateProblem}
          />
        </section>
      </main>
    )
  }

  /* ── Problems list ── */
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] text-slate-900">
      <BlogNavbar
        currentView="problems"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onLogout={onLogout}
      />

      <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">

          {/* ── Left sidebar: Topics ── */}
          <aside className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm self-start lg:sticky lg:top-4 max-h-[calc(100vh-120px)] flex flex-col">
            <p className="px-1 pb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Topics</p>
            <div className="space-y-0.5 overflow-y-auto flex-1 pr-0.5">
              {topics.map((topic) => {
                const isSelected = topic === selectedTopic
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={[
                      'flex w-full items-center rounded-lg border px-3 py-2 text-left text-[13px] transition-all',
                      isSelected
                        ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold shadow-sm'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                    ].join(' ')}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ── Center: Problems table ── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm self-start">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60">
                    <th className="px-5 py-3.5 text-left w-[38%]">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                        Problem
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </span>
                    </th>
                    {['Difficulty', 'Solution', 'Notes', 'Status', 'Bookmark', 'Discuss', 'Concept'].map((h) => (
                      <th key={h} className="px-3 py-3.5 text-center text-[13px] font-semibold text-slate-700 select-none">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingProblems ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                        Loading problems...
                      </td>
                    </tr>
                  ) : !hasProblemsForSelectedTopic ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                        Problems will be added for this topic soon.
                      </td>
                    </tr>
                  ) : (
                    currentProblems.map((row) => {
                    const isSolved = row.solved
                    const isBookmarked = row.bookmarked
                    const isNotesOpen = openNotesId === row.id
                    const isConceptOpen = openConceptId === row.id

                    return (
                      <Fragment key={row.id}>
                        <tr className={[
                          'border-b border-slate-100 last:border-b-0 transition-colors duration-150',
                          isSolved ? 'bg-emerald-200/90 hover:bg-emerald-300/70' : 'hover:bg-slate-50/60',
                        ].join(' ')}>

                          {/* Problem name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={row.judgeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-left text-[14px] text-slate-800 font-medium hover:text-blue-700 hover:underline transition-colors"
                              >
                                {row.name}
                              </a>
                              <a
                                href={row.judgeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open on external judge"
                                className="text-blue-400 hover:text-blue-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            </div>
                          </td>

                          {/* Difficulty badge */}
                          <td className="px-3 py-3.5 text-center">
                            <span className={[
                              'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold select-none',
                              row.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                row.difficulty?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700',
                            ].join(' ')}>
                              {row.difficulty}
                            </span>
                          </td>

                          {/* Solution */}
                          <td className="px-3 py-3.5 text-center">
                            <button type="button" onClick={() => openProblemWithTab(row, 'Solution')} className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isSolved ? 'text-slate-600' : 'text-slate-400 hover:text-slate-600'}>
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
                              </svg>
                            </button>
                          </td>

                          {/* Notes */}
                          <td className="px-3 py-3.5 text-center">
                            <button type="button" onClick={() => setOpenNotesId(isNotesOpen ? null : row.id)} className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={row.notes ? 'text-blue-600' : isSolved ? 'text-slate-600' : 'text-slate-400 hover:text-slate-600'}>
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                            </button>
                          </td>

                          {/* Status checkbox */}
                          <td className="px-3 py-3.5 text-center">
                            <button type="button" onClick={() => toggleStatus(row.id)} className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none">
                              {isSolved ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                  <rect x="3" y="3" width="18" height="18" rx="3" fill="none" /><path d="m9 12 2 2 4-4" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 hover:text-slate-500">
                                  <rect x="3" y="3" width="18" height="18" rx="3" fill="none" />
                                </svg>
                              )}
                            </button>
                          </td>

                          {/* Bookmark */}
                          <td className="px-3 py-3.5 text-center">
                            <button type="button" onClick={() => toggleBookmark(row.id)} className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none">
                              {isBookmarked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 hover:text-amber-500 hover:fill-amber-100 transition-all">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              )}
                            </button>
                          </td>

                          {/* Discuss */}
                          <td className="px-3 py-3.5 text-center">
                            <button type="button" onClick={() => openProblemWithTab(row, 'Discussion')} className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isSolved ? 'text-slate-600' : 'text-slate-400 hover:text-blue-500'}>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                          </td>

                          {/* Concept */}
                          <td className="px-3 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setOpenConceptId(isConceptOpen ? null : row.id)}
                              className="inline-flex justify-center hover:scale-110 transition-transform focus:outline-none"
                              title="Show concepts"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className={isConceptOpen ? 'text-blue-700 fill-blue-100' : 'text-blue-500 hover:text-blue-700'}>
                                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Concept sticky-note row */}
                        {isConceptOpen && (
                          <tr className="border-b border-amber-100 bg-amber-50/70">
                            <td colSpan={8} className="px-5 py-3">
                              <div className="flex items-start gap-2.5">
                                <div className="flex-shrink-0 mt-0.5 w-4 h-4 text-amber-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Key Concepts</span>
                                  <p className="text-[13px] text-slate-700 font-medium leading-snug">{row.concept}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Notes expansion row */}
                        {isNotesOpen && (
                          <tr className={isSolved ? 'bg-emerald-50' : 'bg-slate-50/80'}>
                            <td colSpan={8} className="px-5 py-4 border-b border-slate-100">
                              <div className="max-w-xl">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">My Notes</span>
                                <textarea
                                  className="mt-1.5 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 resize-none"
                                  rows={3}
                                  placeholder="Write personal notes, hints, or approaches..."
                                  value={row.notes}
                                  onChange={(e) => updateNotes(row.id, e.target.value)}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right sidebar: Progress chart ── */}
          <ProgressChart topicName={selectedTopic} problems={currentProblems} />
        </div>
      </section>
    </main>
  )
}
