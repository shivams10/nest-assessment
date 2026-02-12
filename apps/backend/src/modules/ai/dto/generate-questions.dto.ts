export type GenerateQuestionsRequestDto = {
  category: 'aptitude' | 'technical';
  type: 'single_select' | 'multi_select';
  difficulty?: 'easy' | 'medium' | 'hard';
  count: number;
};

export type GeneratedQuestionDto = {
  tempId: string;
  category: 'aptitude' | 'technical';
  type: 'single_select' | 'multi_select';
  difficulty: 'easy' | 'medium' | 'hard';
  stem: string;
  points: number;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
};
