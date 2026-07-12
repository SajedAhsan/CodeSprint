import logoImg from '../../assets/LandingPage/Logo.png'
import heroArtImg from '../../assets/LandingPage/rightTop.png'
import problemsImg from '../../assets/LandingPage/probs.png'
import videoImg from '../../assets/LandingPage/Video.png'
import progressImg from '../../assets/LandingPage/progress.png'
import communityImg from '../../assets/LandingPage/community.png'
import blogImg from '../../assets/LandingPage/blog.png'

export const heroContent = {
  logoImg,
  heroArtImg,
  title: 'Master Coding at Your Own Pace',
  copy:
    'High-quality problems, expert video solutions, and a learning path built for steady progress.',
}

export const featureCards = [
  {
    key: 'problems',
    image: problemsImg,
    title: 'Curated Problems',
    copy: 'Topic-organized problems ranked by difficulty.',
  },
  {
    key: 'videos',
    image: videoImg,
    title: 'Video Solutions',
    copy: 'Clear walkthroughs for each challenge.',
  },
  {
    key: 'progress',
    image: progressImg,
    title: 'Track Your Progress',
    copy: 'See your streaks, solves, and growth over time.',
  },
]

export const communityContent = {
  communityImg,
  blogImg,
  posts: [
    {
      title: 'The Art of Core Algorithm Design',
      copy: 'Focus on patterns, constraints, and simple reasoning.',
    },
    {
      title: 'Understanding Binary Search Trees',
      copy: 'Keep search operations efficient with the right structure.',
    },
    {
      title: 'A Beginner\'s Guide to Dynamic Programming',
      copy: 'Break problems into smaller states and reuse answers.',
    },
  ],
}

export const premiumFeatures = [
  'Exclusive problems',
  'Advanced learning content',
  'Priority support',
]