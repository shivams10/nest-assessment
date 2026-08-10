const AUTHOR_SELECT = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  },
};

export const QUESTION_BANK_LIST_SELECT = {
  id: true,
  tags: true,
  type: true,
  difficulty: true,
  source: true,
  prompt: true,
  points: true,
  createdAt: true,
  updatedAt: true,
  creator: AUTHOR_SELECT,
};

export const QUESTION_BANK_DETAIL_SELECT = {
  ...QUESTION_BANK_LIST_SELECT,
  options: true,
  createdBy: true,
  updatedBy: true,
  updater: AUTHOR_SELECT,
  testCases: {
    select: {
      id: true,
      input: true,
      expectedOutput: true,
      isHidden: true,
      weight: true,
      order: true,
    },
    orderBy: { order: 'asc' as const },
  },
};
