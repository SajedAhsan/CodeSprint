import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

export default function ProblemRegistry({
  problemQuery,
  onChangeQuery,
  topics,
  selectedTopic,
  onSelectTopic,
  problemsByTopic,
  filteredProblems,
  onDeleteProblem,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

  const [showModal, setShowModal] = useState(false)
  const [modalProblem, setModalProblem] = useState(null)
  const [language, setLanguage] = useState('C++')
  const [code, setCode] = useState('')
  const [codeByLanguage, setCodeByLanguage] = useState({})
  const [explanation, setExplanation] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showOnlyProblemId, setShowOnlyProblemId] = useState(null)

  const LANG_OPTIONS = ['C++', 'Java', 'Python']

  function normalizeLanguage(lang) {
    if (!lang) return 'C++'
    const value = lang.toLowerCase()
    if (value.includes('c++') || value.includes('cpp')) return 'C++'
    if (value.includes('java')) return 'Java'
    if (value.includes('python')) return 'Python'
    return lang
  }

  function getEditorCode(targetLanguage, drafts) {
    return drafts[normalizeLanguage(targetLanguage)] || ''
  }

  const openSolutionModal = async (problem) => {
    setModalProblem(problem)
    setLanguage('C++')
    setCode('')
    setCodeByLanguage({})
    setExplanation('')
    setVideoLink('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsLoadingEditorial(true)
    setShowModal(true)

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/editorials/problem/${problem.id}` : `/api/editorials/problem/${problem.id}`
      const res = await fetch(endpoint, { headers: { Accept: 'application/json' } })
      if (!res.ok) {
        setIsLoadingEditorial(false)
        return
      }
      const payload = await res.json()
      if (payload) {
        setExplanation(payload.explanation || '')
        setVideoLink(payload.videoLink || payload.video || '')
        if (Array.isArray(payload.solutions) && payload.solutions.length > 0) {
          const drafts = payload.solutions.reduce((accumulator, solution) => {
            const normalized = normalizeLanguage(solution.language)
            accumulator[normalized] = solution.code || ''
            return accumulator
          }, {})
          const matching = payload.solutions.find((s) => s.language && s.language.toLowerCase().includes('c++'))
          const chosen = matching || payload.solutions[0]
          const selectedLanguage = normalizeLanguage(chosen.language || 'C++')
          setCodeByLanguage(drafts)
          setCode(getEditorCode(selectedLanguage, drafts))
          setLanguage(selectedLanguage)
        }
      }
    } catch (err) {
      // ignore — modal still opens for manual add
    } finally {
      setIsLoadingEditorial(false)
    }
  }

  const closeSolutionModal = () => {
    setShowModal(false)
    setModalProblem(null)
    setErrorMsg('')
  }

  const submitSolution = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!modalProblem) return

    const token = localStorage.getItem('codesprintToken')
    if (!token) {
      setErrorMsg('Please sign in again before adding a solution.')
      return
    }

    const currentCode = getEditorCode(language, codeByLanguage) || code

    if (!language.trim() || !currentCode.trim()) {
      setErrorMsg('Language and code are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const targetId = modalProblem.id || modalProblem.problemId
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/editorials/${targetId}/solutions` : `/api/editorials/${targetId}/solutions`
      
      const draftsToSave = { ...codeByLanguage }
      draftsToSave[language] = currentCode // Ensure active editor is saved

      // Submit all languages that have drafts
      for (const lang of LANG_OPTIONS) {
        if (draftsToSave[lang] !== undefined) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ language: lang.trim(), code: draftsToSave[lang], explanation: explanation.trim(), videoLink: videoLink.trim() }),
          })

          if (!res.ok) {
            const body = await res.json().catch(() => null)
            throw new Error(body?.message || `Failed to add ${lang} solution`)
          }
        }
      }

      // success — show message then close
      setIsSubmitting(false)
      setSuccessMsg('Solution added successfully')
      // show only the added problem in the registry
      setShowOnlyProblemId(modalProblem.id)
      setTimeout(() => {
        setSuccessMsg('')
        closeSolutionModal()
      }, 1200)
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add solution')
    }
  }

  function mapLanguage(lang) {
    if (!lang) return 'plaintext'
    const l = lang.toLowerCase()
    if (l.includes('c++') || l.includes('cpp')) return 'cpp'
    if (l.includes('java')) return 'java'
    if (l.includes('python')) return 'python'
    if (l.includes('javascript') || l.includes('js')) return 'javascript'
    return 'plaintext'
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.18)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Problem registry</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Remove any problem</h2>
        </div>
        <div className="min-w-[220px] flex-1 max-w-sm">
          <input
            type="search"
            value={problemQuery}
            onChange={(event) => onChangeQuery(event.target.value)}
            placeholder="Search problems"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>
        <div className="ml-4">
          {showOnlyProblemId ? (
            <button
              type="button"
              onClick={() => setShowOnlyProblemId(null)}
              className="rounded-full border px-3 py-2 text-sm font-semibold text-white bg-slate-800/60"
            >
              Show all problems
            </button>
          ) : null}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg border-2 border-black relative">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add Solution — {modalProblem?.name}</h3>
              <button
                type="button"
                onClick={closeSolutionModal}
                aria-label="Close"
                className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <form onSubmit={submitSolution} className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{isLoadingEditorial ? 'Loading editorial...' : 'Add or update editorial for the problem'}</div>
                {successMsg ? <div className="text-sm text-emerald-700 font-semibold">{successMsg}</div> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => {
                    const nextLanguage = normalizeLanguage(e.target.value)
                    setLanguage(nextLanguage)
                    setCode(getEditorCode(nextLanguage, codeByLanguage))
                  }}
                  className="mt-1 w-full rounded-md border border-black px-3 py-2 text-sm text-black"
                >
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Brief explanation for the editorial (optional)"
                  className="mt-1 w-full rounded-md border border-black px-3 py-2 text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Video link (YouTube embed url)</label>
                <input
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="mt-1 w-full rounded-md border border-black px-3 py-2 text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Code</label>
                <div className="mt-1 overflow-hidden rounded-md border border-black">
                  <Editor
                    key={language}
                    height="300px"
                    language={mapLanguage(language)}
                    value={code}
                      onChange={(value) => {
                        const nextCode = value || ''
                        setCode(nextCode)
                        setCodeByLanguage((current) => ({
                          ...current,
                          [normalizeLanguage(language)]: nextCode,
                        }))
                      }}
                    options={{ minimap: { enabled: false } }}
                  />
                </div>
              </div>

              {errorMsg ? <p className="text-sm text-rose-600">{errorMsg}</p> : null}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeSolutionModal} className="rounded-full px-4 py-2 text-sm font-semibold border">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
                  {isSubmitting ? 'Adding…' : 'Add Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2 overflow-x-auto pb-1 sm:grid-cols-2 xl:grid-cols-3">
        {topics
          .filter((topic) => (problemsByTopic?.[topic]?.length || 0) > 0)
          .map((topic) => {
            const count = problemsByTopic?.[topic]?.length || 0
            const active = topic === selectedTopic

            return (
              <button
                key={topic}
                type="button"
                onClick={() => onSelectTopic(topic)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-cyan-400 bg-cyan-400/15 text-white'
                    : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/20 hover:bg-white/5',
                ].join(' ')}
              >
                <span className="block text-sm font-medium">{topic}</span>
                <span className="mt-1 block text-xs text-slate-400">{count} problems</span>
              </button>
            )
          })}
      </div>

      <div className="mt-6 space-y-3">
        {(
          showOnlyProblemId
            ? filteredProblems.filter((p) => p.id === showOnlyProblemId)
            : filteredProblems
        ).map((problem) => (
          <article key={`${selectedTopic}-${problem.id}`} className="rounded-3xl border-2 border-black bg-slate-950/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{problem.name}</p>
                <p className="mt-1 text-xs text-slate-400">{problem.concept}</p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteProblem(selectedTopic, problem.id)}
                className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                Delete
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-white/5 px-2.5 py-1">{problem.difficulty}</span>
              <a href={problem.judgeUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                Open judge link
              </a>
              <button
                type="button"
                onClick={() => openSolutionModal(problem)}
                className="ml-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Add Solution
              </button>
            </div>
          </article>
        ))}
        {!filteredProblems.length ? <p className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">No problems match the current filters.</p> : null}
      </div>
    </section>
  )
}