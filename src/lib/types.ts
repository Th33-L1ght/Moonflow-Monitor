
export type CrampLevel = 1 | 2 | 3 | 4;
export type Mood = 'Happy' | 'Moody' | 'Fine' | 'Sad';

export interface SymptomLog {
  date: Date;
  crampLevel: CrampLevel;
  mood: Mood;
  note?: string;
}

export interface Cycle {
  id: string;
  startDate: Date;
  endDate: Date;
  symptoms: SymptomLog[];
}

export interface Child {
  id: string;
  name: string;
  avatarUrl: string;
  cycles: Cycle[];
  parentUid: string;
  childUid?: string;
  username?: string;
}
