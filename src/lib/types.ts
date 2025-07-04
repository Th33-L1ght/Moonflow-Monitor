
export type CrampLevel = 1 | 2 | 3 | 4;
export type Mood = 'Happy' | 'Moody' | 'Fine' | 'Sad';
export type PregnancyTestResult = 'positive' | 'negative';

export interface SymptomLog {
  date: Date;
  crampLevel: CrampLevel;
  mood: Mood;
  note?: string;
  pregnancyTestResult?: PregnancyTestResult;
}

export interface Cycle {
  id: string;
  startDate: Date;
  endDate: Date;
  symptoms: SymptomLog[];
  isPregnancy?: boolean;
}

export interface Child {
  id: string;
  name: string;
  avatarUrl: string;
  cycles: Cycle[];
  parentUid: string;
  isParentProfile?: boolean;
  childUid?: string;
  username?: string;
}
