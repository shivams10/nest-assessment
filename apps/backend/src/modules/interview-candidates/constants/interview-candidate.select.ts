export const INTERVIEW_CANDIDATE_LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  roleApplyingFor: true,
  status: true,
  createdAt: true,
};

export const INTERVIEW_CANDIDATE_DETAIL_SELECT = {
  ...INTERVIEW_CANDIDATE_LIST_SELECT,
  phone: true,
  yearsOfExperience: true,
  skills: true,
  education: true,
  resumeUrl: true,
  referredBy: true,
  addedBy: true,
  updatedAt: true,
};
