import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import BlogNavbar from '../Feed/BlogNavbar'

/* ════════════════════════════════════════════════════════════
   Custom Node Component
════════════════════════════════════════════════════════════ */
function TopicNode({ data }) {
  const isCompleted = data.solved === data.total && data.total > 0
  const hasStarted = data.solved > 0
  const pct = data.total > 0 ? (data.solved / data.total) * 100 : 0

  return (
    <div className="relative group cursor-pointer">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-400 !border-0" />

      <div
        className={[
          'w-48 overflow-hidden rounded-xl border-[2px] bg-white text-center shadow-md transition-all group-hover:shadow-lg',
          isCompleted
            ? 'border-emerald-500 shadow-emerald-500/20'
            : hasStarted
              ? 'border-blue-400 shadow-blue-400/20'
              : 'border-slate-200 shadow-slate-200/50',
        ].join(' ')}
      >
        <div className="p-3">
          <p className="text-sm font-bold text-slate-800">{data.label}</p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            {isCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              {data.solved} / {data.total}
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-slate-100">
          <div
            className={['h-full transition-all duration-500', isCompleted ? 'bg-emerald-500' : 'bg-blue-500'].join(' ')}
            style={{ width: `\${pct}%` }}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-400 !border-0" />
    </div>
  )
}

const nodeTypes = {
  topicNode: TopicNode,
}

/* ════════════════════════════════════════════════════════════
   Roadmap Data
════════════════════════════════════════════════════════════ */
const edgeStyle = { strokeWidth: 2, stroke: '#94a3b8' }

const roadmapsData = {
  roadmap1: {
    title: 'Roadmap 1',
    description: 'Core Data Structures & Algorithms',
    nodes: [
      { id: '1', position: { x: 400, y: 50 }, data: { label: 'Arrays & Hashing', solved: 9, total: 9 }, type: 'topicNode' },
      { id: '2', position: { x: 250, y: 200 }, data: { label: 'Two Pointers', solved: 4, total: 5 }, type: 'topicNode' },
      { id: '3', position: { x: 550, y: 200 }, data: { label: 'Stack', solved: 7, total: 7 }, type: 'topicNode' },
      { id: '4', position: { x: 100, y: 350 }, data: { label: 'Binary Search', solved: 2, total: 7 }, type: 'topicNode' },
      { id: '5', position: { x: 400, y: 350 }, data: { label: 'Sliding Window', solved: 0, total: 6 }, type: 'topicNode' },
      { id: '6', position: { x: 250, y: 500 }, data: { label: 'Linked List', solved: 6, total: 6 }, type: 'topicNode' },
      { id: '7', position: { x: 250, y: 650 }, data: { label: 'Trees', solved: 12, total: 15 }, type: 'topicNode' },
      { id: '8', position: { x: 100, y: 800 }, data: { label: 'Tries', solved: 0, total: 3 }, type: 'topicNode' },
      { id: '9', position: { x: 400, y: 800 }, data: { label: 'Heap / Priority Queue', solved: 2, total: 7 }, type: 'topicNode' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e2-6', source: '2', target: '6', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e7-9', source: '7', target: '9', type: 'smoothstep', animated: true, style: edgeStyle },
    ]
  },
  roadmap2: {
    title: 'Roadmap 2',
    description: 'Advanced Data Structures',
    nodes: [
      { id: '1', position: { x: 250, y: 50 }, data: { label: 'Disjoint Set Union', solved: 2, total: 3 }, type: 'topicNode' },
      { id: '2', position: { x: 250, y: 200 }, data: { label: 'Segment Tree', solved: 0, total: 5 }, type: 'topicNode' },
      { id: '3', position: { x: 250, y: 350 }, data: { label: 'Fenwick Tree', solved: 0, total: 2 }, type: 'topicNode' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, style: edgeStyle },
    ]
  },
  roadmap3: {
    title: 'Roadmap 3',
    description: 'System Design Basics',
    nodes: [
      { id: '1', position: { x: 250, y: 50 }, data: { label: 'Networking Basics', solved: 1, total: 1 }, type: 'topicNode' },
      { id: '2', position: { x: 250, y: 200 }, data: { label: 'Databases', solved: 3, total: 4 }, type: 'topicNode' },
      { id: '3', position: { x: 250, y: 350 }, data: { label: 'Caching', solved: 1, total: 2 }, type: 'topicNode' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, style: edgeStyle },
    ]
  }
}

/* ════════════════════════════════════════════════════════════
   Side Panel Component
════════════════════════════════════════════════════════════ */
function SidePanel({ topic, onClose }) {
  if (!topic) return null

  const pct = topic.total > 0 ? (topic.solved / topic.total) * 100 : 0

  // Mock problems for the selected topic
  const problems = [
    { id: 1, name: 'Valid Parentheses', difficulty: 'Easy', status: 'solved', star: true },
    { id: 2, name: 'Min Stack', difficulty: 'Medium', status: 'unsolved', star: true },
    { id: 3, name: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', status: 'unsolved', star: false },
    { id: 4, name: 'Daily Temperatures', difficulty: 'Medium', status: 'unsolved', star: false },
    { id: 5, name: 'Car Fleet', difficulty: 'Medium', status: 'unsolved', star: false },
    { id: 6, name: 'Largest Rectangle In Histogram', difficulty: 'Hard', status: 'unsolved', star: true },
  ].slice(0, topic.total) // Adjust mock list size to match total count

  return (
    <div className="absolute top-0 right-0 h-full w-[600px] max-w-full bg-white shadow-2xl z-20 flex flex-col transform transition-transform border-l border-slate-200">
      {/* Top Header */}
      <div className="relative flex flex-col items-center p-6 border-b border-slate-100">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-500 shadow-sm hover:bg-slate-50 transition"
        >
          ESC
        </button>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{topic.label}</h2>
        <p className="text-sm font-semibold text-slate-500 mt-1 mb-4">
          ({topic.solved} / {topic.total})
        </p>
        <div className="w-64 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `\${pct}%` }} />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {/* Prerequisites */}
        <div className="mb-8">
          <h3 className="text-center text-sm font-semibold text-slate-500 mb-4">Prerequisites</h3>
          <div className="mx-auto w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-sm">{topic.label} Basics</p>
              <p className="text-xs text-blue-500 mt-0.5">Data Structures & Algorithms</p>
            </div>
            <div className="w-5 h-5 rounded border border-slate-300 bg-slate-50" />
          </div>
        </div>

        {/* Problem List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-700 w-16 text-center">Status</th>
                <th className="px-2 py-3 font-bold text-slate-700 w-12 text-center">Star</th>
                <th className="px-4 py-3 font-bold text-slate-700">Problem</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-24 text-center">Difficulty</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-20 text-center">Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {problems.map((prob) => (
                <tr key={prob.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 text-center">
                    {prob.status === 'solved' ? (
                      <div className="mx-auto w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    ) : (
                      <div className="mx-auto w-5 h-5 rounded border-2 border-slate-300 bg-white" />
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <svg className={`mx-auto w-4 h-4 \${prob.star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-2">
                    {prob.name}
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                    <span className={
                      prob.difficulty === 'Easy' ? 'text-emerald-500' :
                        prob.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                    }>
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-slate-400 hover:text-slate-800 transition">
                      <svg className="mx-auto w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   Roadmap Page
════════════════════════════════════════════════════════════ */
export default function RoadmapPage({
  onNavigateBlog,
  onNavigateProblems,
  onNavigatePostBlog,
  onNavigateProfile,
  onNavigateRoadmap,
}) {
  const [activeRoadmapId, setActiveRoadmapId] = useState('roadmap1')
  const [selectedTopic, setSelectedTopic] = useState(null)

  // Derive active roadmap data
  const activeRoadmap = roadmapsData[activeRoadmapId]
  const { nodes, edges } = activeRoadmap

  // Calculate overall progress for the active roadmap
  const { totalSolved, totalAvailable } = useMemo(() => {
    let s = 0, t = 0
    nodes.forEach(n => {
      s += n.data.solved
      t += n.data.total
    })
    return { totalSolved: s, totalAvailable: t }
  }, [nodes])
  const overallPct = totalAvailable > 0 ? (totalSolved / totalAvailable) * 100 : 0

  // Handle Node Click
  const onNodeClick = useCallback((event, node) => {
    setSelectedTopic(node.data)
  }, [])

  // Close Panel
  const closePanel = () => setSelectedTopic(null)

  return (
    <main className="flex h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] overflow-hidden relative">
      <BlogNavbar
        currentView="roadmap"
        onNavigateBlog={onNavigateBlog}
        onNavigateProblems={onNavigateProblems}
        onNavigatePostBlog={onNavigatePostBlog}
        onNavigateProfile={onNavigateProfile}
        onNavigateRoadmap={onNavigateRoadmap}
      />

      {/* Top Controls: Roadmap Tabs & Overall Progress */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 relative">
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-inner">
          {Object.entries(roadmapsData).map(([id, data]) => (
            <button
              key={id}
              onClick={() => {
                setActiveRoadmapId(id)
                setSelectedTopic(null)
              }}
              className={[
                'px-6 py-2 rounded-full text-sm font-bold transition-all',
                activeRoadmapId === id
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              ].join(' ')}
            >
              {data.title}
            </button>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="flex flex-col w-full md:w-64">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
            <span className="text-xs font-bold text-blue-600">{totalSolved} / {totalAvailable}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `\${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {/* We use a key on ReactFlow so it completely remounts and resets zoom/pan when switching roadmaps */}
        <ReactFlow
          key={activeRoadmapId}
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-left"
        >
          <Background color="#cbd5e1" gap={24} size={2} />
          <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-xl overflow-hidden" />
        </ReactFlow>
      </div>

      {/* Side Panel Overlay */}
      <SidePanel topic={selectedTopic} onClose={closePanel} />
    </main>
  )
}
