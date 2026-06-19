export type CandidateStatus = 'Screening' | 'Interviewing' | 'Offer' | 'Hired'

export type RecruiterCandidate = {
  id: string
  name: string
  role: string
  email: string
  location: string
  experience: string
  status: CandidateStatus
  lastActivity: string
  nextStep: string
}

export const recruiterCandidates: RecruiterCandidate[] = [
  {
    id: 'c1',
    name: 'Amina Patel',
    role: 'Frontend Engineer',
    email: 'amina.patel@interop.com',
    location: 'Austin, TX',
    experience: '5 years',
    status: 'Interviewing',
    lastActivity: 'Resume reviewed · 3h ago',
    nextStep: 'Schedule final panel',
  },
  {
    id: 'c2',
    name: 'Ethan Brooks',
    role: 'Product Designer',
    email: 'ethan.brooks@worklab.com',
    location: 'Remote',
    experience: '6 years',
    status: 'Screening',
    lastActivity: 'Phone screen requested · Yesterday',
    nextStep: 'Book intro interview',
  },
  {
    id: 'c3',
    name: 'Nina Wong',
    role: 'Full Stack Developer',
    email: 'nina.wong@techflow.io',
    location: 'New York, NY',
    experience: '7 years',
    status: 'Offer',
    lastActivity: 'Hiring manager feedback · 1d ago',
    nextStep: 'Send offer letter',
  },
]

export type RecruiterInterview = {
  id: string
  candidateId: string
  candidateName: string
  interviewer: string
  date: string
  time: string
  location: string
  status: 'Confirmed' | 'Tentative' | 'Completed'
}

export const recruiterInterviews: RecruiterInterview[] = [
  {
    id: 'i1',
    candidateId: 'c1',
    candidateName: 'Amina Patel',
    interviewer: 'Kara Singh',
    date: 'Tue, Jul 2',
    time: '10:00 AM',
    location: 'Zoom',
    status: 'Confirmed',
  },
  {
    id: 'i2',
    candidateId: 'c2',
    candidateName: 'Ethan Brooks',
    interviewer: 'Jordan Lee',
    date: 'Wed, Jul 3',
    time: '2:00 PM',
    location: 'Google Meet',
    status: 'Tentative',
  },
]

export type CandidateReview = {
  id: string
  author: string
  role: string
  date: string
  message: string
}

export const candidateReviews: Record<string, CandidateReview[]> = {
  c1: [
    {
      id: 'r1',
      author: 'Kara Singh',
      role: 'Recruiter',
      date: '2026-06-16',
      message: 'Strong frontend experience. Confirmed availability for panel interview next week.',
    },
    {
      id: 'r2',
      author: 'Tomas Reed',
      role: 'Hiring Manager',
      date: '2026-06-17',
      message: 'Liked the product thinking and collaboration examples.',
    },
  ],
  c2: [
    {
      id: 'r3',
      author: 'Nina Patel',
      role: 'Recruiter',
      date: '2026-06-15',
      message: 'Has strong UX process evidence and a good portfolio. Needs follow-up on design system experience.',
    },
  ],
  c3: [
    {
      id: 'r4',
      author: 'Kara Singh',
      role: 'Recruiter',
      date: '2026-06-14',
      message: 'Hiring manager wants offer moved forward if compensation aligns.',
    },
  ],
}
