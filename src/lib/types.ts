import type { User as FirebaseUser } from 'firebase/auth';

export type CrampLevel = 1 | 2 | 3 | 4;
export type Mood = 'Happy' | 'Moody' | 'Fine' | 'Sad';

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
  parentUid: string;
  childUid?: string;
}

export interface AppUser extends FirebaseUser {
    role: 'parent' | 'child';
    childProfile?: Child;
}

export interface Invite {
    id: string;
    parentUid: string;
    childId: string;
    status: 'pending' | 'accepted';
    createdAt: Date;
}
