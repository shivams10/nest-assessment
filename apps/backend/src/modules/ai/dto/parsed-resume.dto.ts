export interface ParsedResumeEducation {
  degree: string;
  institution: string;
  year: number | null;
}

export interface ParsedResume {
  phone: string | null;
  skills: string[];
  yearsOfExperience: number | null;
  education: ParsedResumeEducation[];
}
