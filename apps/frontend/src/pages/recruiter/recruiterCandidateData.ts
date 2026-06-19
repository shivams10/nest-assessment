import type {
  Candidate,
  CandidateFeedbackItem,
  CandidateComment,
  InterviewHistoryItem,
} from '@/types/candidate.types'

export const INTERVIEW_ROOMS = ['Room A', 'Room B', 'Room C', 'Room D']

export const recruiterCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '+1 (555) 0912',
    role: 'Senior Frontend Engineer',
    status: 'Scheduled',
    resume: 'sarah-jenkins.pdf',
    location: 'San Francisco, CA',
    experience: '8 years experience in product and consumer frontend applications',
    interviewHistory: [
      {
        round: 'Phone Screen',
        date: 'May 10, 2026',
        interviewer: 'Grace Liu',
        outcome: 'Passed',
        score: '8.4/10',
      },
      {
        round: 'Technical Interview',
        date: 'May 12, 2026',
        interviewer: 'Alex Rivera',
        outcome: 'Scheduled',
      },
    ],
    feedbackHistory: [
      {
        round: 'Phone Screen',
        date: 'May 10, 2026',
        author: 'Grace Liu',
        message: 'Strong communication and clear React fundamentals.',
      },
    ],
    comments: [
      {
        id: 'c1',
        author: 'Elena Rodriguez',
        date: 'May 11, 2026',
        message: 'Confirm interviewer availability for technical round.',
      },
    ],
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    email: 'm.thorne@work.co',
    phone: '+1 (555) 3244',
    role: 'Product Designer',
    status: 'Awaiting Feedback',
    resume: 'marcus-thorne.pdf',
    location: 'Seattle, WA',
    experience: '7 years designing complex SaaS workflows and dashboards',
    interviewHistory: [
      {
        round: 'Phone Screen',
        date: 'May 8, 2026',
        interviewer: 'Nina Patel',
        outcome: 'Passed',
        score: '8.1/10',
      },
      {
        round: 'Practical Design Exercise',
        date: 'May 11, 2026',
        interviewer: 'Yara Khan',
        outcome: 'Pending Feedback',
      },
    ],
    feedbackHistory: [
      {
        round: 'Practical Design Exercise',
        date: 'May 11, 2026',
        author: 'Yara Khan',
        message: 'Needs more clarity on system-level tradeoffs.',
      },
    ],
    comments: [
      {
        id: 'c2',
        author: 'Sarah Jenkins',
        date: 'May 12, 2026',
        message: 'Review portfolio case study before next round.',
      },
    ],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.rod@dev.io',
    phone: '+1 (555) 7832',
    role: 'DevOps Architect',
    status: 'Interviewed',
    resume: 'elena-rodriguez.pdf',
    location: 'Austin, TX',
    experience: '10 years building scalable cloud platforms and CI/CD pipelines',
    interviewHistory: [
      {
        round: 'Technical Interview',
        date: 'May 5, 2026',
        interviewer: 'Marcus Wright',
        outcome: 'Passed',
        score: '9.0/10',
      },
      {
        round: 'Leadership Interview',
        date: 'May 7, 2026',
        interviewer: 'Elena Rodriguez',
        outcome: 'Passed',
        score: '8.7/10',
      },
    ],
    feedbackHistory: [
      {
        round: 'Leadership Interview',
        date: 'May 7, 2026',
        author: 'Elena Rodriguez',
        message: 'Strong ownership mindset and excellent architecture rationale.',
      },
    ],
    comments: [
      {
        id: 'c3',
        author: 'Sarah Jenkins',
        date: 'May 8, 2026',
        message: 'Recommend fast follow with hiring manager.',
      },
    ],
  },
]
