export const blogPosts = [
  {
    id: 1,
    title: 'Building a Strong React Architecture for Fast Iteration',
    author: 'Ava Johnson',
    timePosted: '12 min ago',
    body: [
      'I started by separating presentation from stateful logic so each part of the interface could evolve without breaking the rest of the app.',
      'The biggest improvement came from keeping shared UI pieces small and reusable, then composing them into bigger screens with clear responsibility boundaries.',
      'That structure makes it much easier to ship new features quickly while keeping the design clean and readable.',
    ],
    comments: [
      { author: 'Mia', text: 'The state split here is especially clean.', replies: [] },
      { author: 'Noah', text: 'I like the component boundaries.', replies: [] },
    ],
    votes: 18,
  },
  {
    id: 2,
    title: 'How I Track Problem-Solving Progress Every Day',
    author: 'Rohan Patel',
    timePosted: '45 min ago',
    body: [
      'My daily routine is simple: solve one easy problem to warm up, one medium problem to stay focused, and one hard problem to stretch my thinking.',
      'I also write a short note after each session explaining what pattern I used, what I missed, and what I would do differently next time.',
    ],
    comments: [{ author: 'Zara', text: 'The routine is simple but effective.', replies: [] }],
    votes: 11,
  },
  {
    id: 3,
    title: 'Posting Blogs That Stay Clear, Useful, and Consistent',
    author: 'Sophia Lee',
    timePosted: '2 hours ago',
    body: [
      'A strong post usually has one main idea, a short opening, and a few concrete examples that make the message easy to follow.',
      'I try to keep the writing direct and practical so readers can quickly understand the point without digging through extra noise.',
    ],
    comments: [],
    votes: 24,
  },
]

export const quickStats = [
  { label: 'Blogs today', value: '24' },
  { label: 'Active readers', value: '1.8k' },
  { label: 'Comments', value: '319' },
]