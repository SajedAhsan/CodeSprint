const problemTopics = [
  'Basic Problems',
  'Prefix Sum',
  'Sliding Window',
  'Two pointer',
  'Sorting',
  'Binary Search',
  'Bit Manupulation',
  'Dynamic Programming',
  'Minimum Spanning Tree',
  'Topological Sort',
  'Shortest Path',
  'BFS',
  'DFS',
  'Range Queries',
  'Tree Algorithms',
  'Mathematics',
  'String Algorithms',
  'Geometry',
]

function buildProblemMeta(name, concept, judgeUrl) {
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
        Java: `import java.util.*;
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
        Python: `import sys
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

function createProblemEntry({ id, name, difficulty, concept, judgeUrl, solved = false, bookmarked = false, notes = '' }) {
  return {
    id,
    name,
    difficulty,
    solved,
    bookmarked,
    notes,
    concept,
    ...buildProblemMeta(name, concept, judgeUrl),
  }
}

const seedProblems = {
  'Basic Problems': [
    createProblemEntry({ id: 1, name: '1. Three Activities', difficulty: 'Medium', concept: 'Greedy, Sorting, Brute Force', judgeUrl: 'https://codeforces.com/problemset/problem/1914/D' }),
    createProblemEntry({ id: 2, name: '2. Make Almost Equal With Mod', difficulty: 'Medium', concept: 'Math, Number Theory, Binary Search', judgeUrl: 'https://codeforces.com/problemset/problem/1910/B' }),
    createProblemEntry({ id: 3, name: '3. Plus Minus Permutation', difficulty: 'Medium', concept: 'Math, Number Theory, GCD', judgeUrl: 'https://codeforces.com/problemset/problem/1872/D' }),
    createProblemEntry({ id: 4, name: '4. Assembly via Minimums', difficulty: 'Medium', solved: true, concept: 'Greedy, Constructive Algorithms, Sorting', judgeUrl: 'https://codeforces.com/problemset/problem/1857/C' }),
    createProblemEntry({ id: 5, name: '5. Vika and the Bridge', difficulty: 'Medium', solved: true, concept: 'Binary Search, Greedy, Two Pointers', judgeUrl: 'https://codeforces.com/problemset/problem/1848/B' }),
    createProblemEntry({ id: 6, name: '6. Contrast Value', difficulty: 'Medium', concept: 'Greedy, Two Pointers, Implementation', judgeUrl: 'https://codeforces.com/problemset/problem/1837/D' }),
    createProblemEntry({ id: 7, name: '7. Playing in a Casino', difficulty: 'Medium', concept: 'Math, Sorting, Greedy', judgeUrl: 'https://codeforces.com/problemset/problem/1808/B' }),
    createProblemEntry({ id: 8, name: '8. Dora and Search', difficulty: 'Medium', concept: 'Two Pointers, Greedy, Constructive Algorithms', judgeUrl: 'https://codeforces.com/problemset/problem/1793/C' }),
    createProblemEntry({ id: 9, name: '9. Matryoshkas', difficulty: 'Medium', concept: 'Greedy, Sorting, Data Structures', judgeUrl: 'https://codeforces.com/problemset/problem/1790/D' }),
    createProblemEntry({ id: 10, name: '10. Scuza', difficulty: 'Medium', concept: 'Binary Search, Prefix Sums, Two Pointers', judgeUrl: 'https://codeforces.com/problemset/problem/1742/E' }),
    createProblemEntry({ id: 11, name: '11. Removing Smallest Multiples', difficulty: 'Medium', concept: 'Math, Number Theory, Sieve of Eratosthenes', judgeUrl: 'https://codeforces.com/problemset/problem/1734/C' }),
  ],
  'Prefix Sum': [
    createProblemEntry({ id: 1, name: '1. Static Range Sum Queries', difficulty: 'Easy', concept: 'Prefix Sums', judgeUrl: 'https://cses.fi/problemset/task/1646' }),
    createProblemEntry({ id: 2, name: '2. Subarray Sum Equals K', difficulty: 'Medium', concept: 'Prefix Sums, Hash Map', judgeUrl: 'https://codeforces.com/problemset/problem/1398/C' }),
    createProblemEntry({ id: 3, name: '3. Breed Counting', difficulty: 'Medium', concept: 'Prefix Sums, Multi-Dimensional Array', judgeUrl: 'https://codeforces.com/problemset/problem/1118/B' }),
    createProblemEntry({ id: 4, name: '4. Subarray Divisibility', difficulty: 'Medium', concept: 'Prefix Sums, Math, Modulo', judgeUrl: 'https://codeforces.com/problemset/problem/1352/E' }),
    createProblemEntry({ id: 5, name: '5. Max Value Array Range Updates', difficulty: 'Hard', concept: 'Prefix Sums, Difference Array', judgeUrl: 'https://codeforces.com/problemset/problem/166E' }),
  ],
  'Sliding Window': [
    createProblemEntry({ id: 1, name: '1. Maximum Average Subarray I', difficulty: 'Easy', concept: 'Sliding Window', judgeUrl: 'https://codeforces.com/problemset/problem/1203/B' }),
    createProblemEntry({ id: 2, name: '2. Longest Substring Without Repeating Characters', difficulty: 'Medium', concept: 'Sliding Window, Hash Map', judgeUrl: 'https://codeforces.com/problemset/problem/1327/B' }),
    createProblemEntry({ id: 3, name: '3. Minimum Window Substring', difficulty: 'Hard', concept: 'Sliding Window, Two Pointers, Frequency Map', judgeUrl: 'https://codeforces.com/problemset/problem/165C' }),
    createProblemEntry({ id: 4, name: '4. Sliding Window Maximum', difficulty: 'Hard', concept: 'Sliding Window, Monotonic Deque', judgeUrl: 'https://codeforces.com/problemset/problem/377A' }),
  ],
  'Two pointer': [
    createProblemEntry({ id: 1, name: '1. Two Sum II - Sorted Input', difficulty: 'Easy', concept: 'Two Pointers, Binary Search', judgeUrl: 'https://codeforces.com/problemset/problem/70A' }),
    createProblemEntry({ id: 2, name: '2. 3Sum', difficulty: 'Medium', concept: 'Two Pointers, Sorting', judgeUrl: 'https://codeforces.com/problemset/problem/1807/G' }),
    createProblemEntry({ id: 3, name: '3. Container With Most Water', difficulty: 'Medium', concept: 'Two Pointers, Greedy', judgeUrl: 'https://codeforces.com/problemset/problem/1638/C' }),
    createProblemEntry({ id: 4, name: '4. Trapping Rain Water', difficulty: 'Hard', concept: 'Two Pointers, Monotonic Stack', judgeUrl: 'https://codeforces.com/problemset/problem/1157/C2' }),
  ],
}

function createInitialProblems() {
  const map = {}

  Object.entries(seedProblems).forEach(([topic, list]) => {
    map[topic] = list.map((problem) => ({ ...problem }))
  })

  problemTopics.forEach((topic) => {
    if (map[topic]) return

    map[topic] = Array.from({ length: 11 }, (_, index) => {
      const id = index + 1
      const difficulty = index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard'
      const concept = `${topic}, Algorithm Design`

      return createProblemEntry({
        id,
        name: `${id}. ${topic} Problem ${id}`,
        difficulty,
        concept,
        judgeUrl: 'https://codeforces.com/problemset',
      })
    })
  })

  return map
}

function createBlogPost({ id, title, author, timePosted, body, comments = [], votes = 0 }) {
  return {
    id,
    title,
    author,
    timePosted,
    body,
    comments,
    votes,
  }
}

function createInitialBlogPosts() {
  return [
    createBlogPost({
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
    }),
    createBlogPost({
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
    }),
    createBlogPost({
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
    }),
  ]
}

export { problemTopics, buildProblemMeta, createProblemEntry, createInitialProblems, createInitialBlogPosts }