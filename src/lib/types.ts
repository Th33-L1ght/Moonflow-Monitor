export type CrampLevel = 1 | 2 | 3 | 4;
export type Mood = 'Happy' | 'Sad' | 'Irritable' | 'Calm' | 'Anxious';

export interface SymptomLog {
  date: Date;
  crampLevel: CrampLevel;
  mood: Mood;
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
}
